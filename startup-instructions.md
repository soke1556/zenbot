**INSTRUCTIONS FOR SETTING UP ZENBOT ON WINDOWS 10**
* See this: https://github.com/DeviaVir/zenbot

**INSTRUCTIONS FOR STARTING UP ZENBOT ON WINDOWS 10**

1) <code>docker-compose up</code>
    * Wait until finishes. Then ctrl+c to cancel de process.
2) <code>docker-compose start</code>
3) Run <code>docker ps</code>
    * You should see something like this:
        <code>
        | CONTAINER ID   |     IMAGE                     | COMMAND                 | CREATED            | STATUS                       | PORTS        | NAMES              |
        |----------------|:-----------------------------:|:-----------------------:|:------------------:|:----------------------------:|:------------:|:------------------:|
        | babcce875543   |     deviavir/zenbot:unstable  | "/app/zenbot.sh trad…"  | 23 hours ago       | Restarting (1) 1 second ago  |              | zenbot_server_1    |
        | 27461da07463   |     mongo:latest              | "docker-entrypoint.s…"  | 40 hours ago       | Up 3 seconds                 | 27017/tcp    | zenbot_mongodb_1   |
         </code>
4) <code>docker-compose exec server zenbot list-selectors</code>
    * If *Error: Cannot find module 'semver'*
        * run this: <code>npm install</code>
    * If you see a list of all the available assets pairs, you're done: zenbot is running properly.

5) Verify all available strategies:
    * <code>docker-compose exec server zenbot list-strategies</code>
6) Running algo in Paper Trading mode:
    * Will run with the default pair defined in *conf.js* at: <code>c.selector</code>
    * <code>docker-compose exec server zenbot trade --paper --strategy algo</code>
7) Running algo in Paper Trading mode:
    * Will run with the default pair defined in *conf.js* at: <code>c.selector</code>
    * <code>docker-compose exec server zenbot trade --strategy algo</code>