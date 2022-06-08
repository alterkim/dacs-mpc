# DACS - MPC part

## Node Environment
```
node : 16.15.1
npm : 8.11.0
```

## Use nodeenv
```
$ nodeenv --node=16.15.1 --npm=8.11.0 node-16
```

## MPC backbone
```
$ ROCKET_ADDRESS=127.0.0.1 ROCKET_PORT=8008 tss-ecdsa-cli/target/release/tss_cli manager
```

## Dashboard
```
$ cd dashboard
$ npm run start
or
$ npm run build
$ serve -l PORT -s build
```

## MPC-Server
```
$ cd mpc_server/src
$ npm run dev
```

