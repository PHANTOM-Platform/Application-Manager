
# i=AWkQenOhd13gSFrj61mJ;

# curl -XPOST http://127.0.0.1:9400/app_manager_db/tasks/${i}/_update?pretty="true" -d '{ "doc" : { "labels": "values",
# "project": "demo_hpc",
# "source": {"status": "finished",
# "my_user_label":"addtional labels are optional", "any_other_user_label":"mondays" },
# "pt_code_analysis":  {"status": "waiting"},
# "mbt_early_validation": {"status": "waiting"},
# "ip_core_generator": {"status": "waiting", "some_label":"some_description_for_mom"},
# "mom": {"status": "waiting", "comment":"completed when a mapping is available, then we can run the app"}
# } }';


curl -XPOST localhost:9400/app_manager_db/tasks -d '{
"labels": "values",
"project": "demo_hpc",
"source": {"status": "finished",
"my_user_label":"addtional labels are optional", "any_other_user_label":"mondays" },
"pt_code_analysis":  {"status": "waiting"},
"mbt_early_validation": {"status": "waiting"},
"ip_core_generator": {"status": "waiting", "some_label":"some_description_for_mom"},
"mom": {"status": "waiting", "comment":"completed when a mapping is available, then we can run the app"}
} '

#reportmonitor.sh -i app_manager_db/tasks -n 10
#curl -XGET 'localhost:9400/app_manager_db/tasks/_search?size=10&pretty="true"'

exit

- “waiting” - tool waiting for some tool our resource to be available 
- “started” - tool started its activity
- “finished” - tool finished its activity
- “error” - tool encountered an error
