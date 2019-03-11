curl -XPOST localhost:9400/mf/logs -d '{
		"user" : "montana@abc.com",
		"code" : 200,
		"ip" : "::ffff:127.0.0.1",
		"message" : "testing ...",
		"date" : "2018-12-10T15:55:16.792"
}';

reportmonitor.sh -i mf/logs -n 10


