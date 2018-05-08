#TEST OF WEBSOCKETS FROM THE APP MANAGER

#start the servers, in case they are not running yet
bash start-es.sh;
bash start-appmanager.sh;

#run a client, which will suscribe to some entries at the Projects (tasks), Devices, and app Executions TABLES.

bash test_appman_ws_suscriber.sh;


#I suggest to run the next strings on a different terminal, or computer, to make it clear what is the feedback to the suscribed client
#update entries in the DB to see if we get the notifications:
bash test_appman_devices_update_db.sh

bash test_appman_tasks_update_db.sh

bash test_appman_execs_update_db.sh

