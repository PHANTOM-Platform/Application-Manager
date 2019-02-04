# TEST OF WEBSOCKETS FROM THE APP-Resource MANAGER

> PHANTOM APP-Resource MANAGER server collets and stores the status of PHANTOM tools, the available resources in the PHANTOM environment, and sumarized stats of previous execution of executed applications.

## Introduction

The objective of this folder is to provide an example of suscription to the websockets service of the APP-Resource Manager.

The example consists of a java application which suscribes to JSON updates for some device updates, and some project updates, and some execution updates.

Following the next steps that java application will report on the screen the reception of the notifications.
Such notifications consists of JSON strings updates which are only sent to those who be suscribed.

## Steps


#### 1.- start the servers, in case they are not running yet
```bash
bash start-es.sh;
bash start-appmanager.sh;
```
#### 2.- in case the DB was not created or any user not registered, then run:
```bash
bash ../api_command_line/demo_admin_appman_curl.sh
```

#### 3.- run a client, which will suscribe to some entries at the Projects (tasks), Devices, and app Executions TABLES.
```bash
bash test_client_ws_suscriber_appmanager.sh;
```

#### 4.- Perform some updates to the APP-Resource Manager, which will be forwared to the suscribed client

I suggest to run the next strings on a different terminal, or computer, to make it clear what is the feedback to the suscribed client
 
```bash
bash test_appman_project_update_db.sh
```

Demonstration step-by-step video of suscribing with JAVA to notifications to the APP-Manager is available at [Demo WS][Demo WS].

[Demo WS]: https://www.youtube.com/watch?v=NByRNFJG1tI
