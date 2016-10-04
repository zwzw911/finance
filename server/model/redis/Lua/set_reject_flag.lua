--[[
根据ip或者sess直接设置用户reject flag（10min中拒绝访问）
--]]

--读取参数（js object），转换成lua table格式
--如果没有params，ioredis会转换成空字符
local params
local b
if ''~=ARGV[1] then
	params=ARGV[1]
	local temp=string.gsub(params,':','=')
	b=loadstring("return "..temp)
	params=b()
end

--db 1 for interval check
redis.call('select',1)
redis.call('set',params['id']..':rejectFlag',1)
redis.call('expire',params['id']..':rejectFlag',params['ttl'])
return '{rc:0}'
--[[if ''==params then
return 1001
else
return cjson.encode(params)
end --]]

