--[[
����ip����sessֱ�������û�reject flag��10min�оܾ����ʣ�
--]]

--��ȡ������js object����ת����lua table��ʽ
--���û��params��ioredis��ת���ɿ��ַ�
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

