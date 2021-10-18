import path from 'path';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import readline from 'readline'

import { ProtoGrpcType } from '../proto/random';

const PORT = 8082;
const PROTO_FILE = '../proto/random.proto';

const packageDef = protoLoader.loadSync(path.resolve(__dirname, PROTO_FILE));
const grpcObject = (grpc.loadPackageDefinition(packageDef) as unknown) as ProtoGrpcType;

const client = new grpcObject.randomPackage.Random(`0.0.0.0:${PORT}`, grpc.credentials.createInsecure());

const deadline = new Date();
deadline.setSeconds(deadline.getSeconds() + 5);
client.waitForReady(deadline, (err) => {
    if (err) {
        console.error(err)
        return
    }

    onClientReady();
});

function onClientReady(){

    /*
    client.PingPong({message: 'Ping'}, (err, result) => {
        if(err){
            console.error(err);
            return;
        }

        console.log(result);
    });
    */

    /*
    const streamer = client.RandomNumber({maxVal: 20});

    streamer.on('data', (chunk) => {
        console.log(chunk)
    });

    streamer.on('end', () => {
        console.log('Communication terminated')
    });

    */
/*
    const stream = client.TodoList((err, results) => {
        if(err){
            console.error(err);
            return;
        }

        console.log(results);
    });

    stream.write({todo: 'Learn how to use gRPC', status: 'Pending'});
    stream.write({todo: 'Learn how to use typescript for react', status: 'Done'});
    stream.write({todo: 'Master react-native', status: 'Pending'});
    stream.write({todo: 'Start cooking for myself', status: 'Pending'});
    stream.end();
    */

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      })
    
      const username = process.argv[2]
      if (!username) console.error("No username, can't join chat"), process.exit()
    
    
      const metadata = new grpc.Metadata()

      metadata.set("username", username)
      const call = client.Chat(metadata)
      
      call.write({
        message: "register"
      })
    
      call.on("data", (chunk) => {
        console.log(`${chunk.username} ==> ${chunk.message}`)
      })
    
      rl.on("line", (line) => {
        if(line === "quit") {
          call.end()
        }else {
          call.write({
            message: line
          })
        }
    
      })
}