--check ionterval base on ip or session

--identify: can be ip or sessionid
local params,b,temp
-- local b
-- local temp
if ''~=ARGV[1] then
	temp=string.gsub(ARGV[1],':','=')

	b=loadstring("return "..temp)
	params=b()
end
-- return params['setting']['expireTimeBetween2Req']
-- local identify=params['id']
local identify=params['id']
local currentTime=tonumber(params['currentTime'])

local setting=params['setting']

redis.call('select',1)
-- reqlist exist time
local expireTimeOfReqList=3*setting.duration
-- return (expireTimeOfReqList)
-- increase reject times and set reject flag and TTL based on reject times
local setRejectFlagBasedOnRejectTimes=function()
	local newRejectTimes=tonumber(redis.call('incr',identify..':rejectTimes'))
	redis.call('expire',identify..':rejectTimes',setting.expireTimeOfRejectTimes)	
	local ttl
	
	local ttlSecond={30,60,120,240,600}
	local timesExceedThreshold=newRejectTimes-tonumber(setting.rejectTimesThreshold)
	
	if( 0 >= timesExceedThreshold ) then
		return '{"rc":0}'
	end
	
	if( timesExceedThreshold > #ttlSecond ) then
		ttl=ttlSecond[#ttlSecond]
	else
		ttl=ttlSecond[timesExceedThreshold]
	end 


	redis.call('set',identify..':rejectFlag',0)
	redis.call('expire',identify..':rejectFlag',ttl)
	-- redis.call('set',identify..':rejectTimes',0)

	return '{"rc":0}'		
end


-- check Flag
if(1==redis.call('exists',identify..':rejectFlag')) then
	setRejectFlagBasedOnRejectTimes()
	local leftTTL=redis.call('ttl',identify..':rejectFlag')
	-- local r={rc=10,msg=leftTTL}
	return '{"rc":10,"msg":'..leftTTL..'}'
	-- return ({rc=10,msg=leftTTL})
end 

if(1==redis.call('exists',identify..':lastReqFlag')) then
	setRejectFlagBasedOnRejectTimes()
	return '{"rc":11}'
end

if(1==redis.call('exists',identify..':reqListFlag')) then
	setRejectFlagBasedOnRejectTimes()
	return '{"rc":12}'
end


-- save last req time
redis.call('set',identify..':lastReqFlag',0)
redis.call('pexpire',identify..':lastReqFlag',setting.expireTimeBetween2Req)
-- check times in duration
local currentTimes=redis.call('llen',identify..':reqList')
local definedTimes=setting.timesInDuration

-- local currentTime=os.time()
if(currentTimes<definedTimes) then
	redis.call('rpush',identify..':reqList',currentTime)
	redis.call('expire',identify..':reqList',expireTimeOfReqList)
	-- return (setting.expireTimeBetween2Req)
		-- return (setting.duration)
	return '{"rc":0}'
else
	local firstReqTime=tonumber(redis.call('lindex',identify..':reqList',0))	
	if(firstReqTime+setting.duration*1000<=currentTime) then
		redis.call('lpop',identify..':reqList')
		redis.call('rpush',identify..':reqList',currentTime)
		redis.call('expire',identify..':reqList',expireTimeOfReqList)
		return '{"rc":0}'
	else
		setRejectFlagBasedOnRejectTimes()
		-- calc TTL of next valid time
		local nextValidTTL=math.ceil((firstReqTime+setting.duration*1000-currentTime)/1000)
		redis.call('set',identify..':reqListFlag',0)
		redis.call('expire',identify..':reqListFlag',nextValidTTL)
		redis.call('expire',identify..':reqList',expireTimeOfReqList)
		return '{"rc":12}'
	end
end



