import path from 'path';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { ProtoGrpcType } from '../proto/random';
import { RandomHandlers } from '../proto/randomPackage/Random'
import { TodoResponse } from '../proto/randomPackage/TodoResponse';

const PORT = 8082;
const PROTO_FILE = '../proto/random.proto';

const TODOS :Array<object> = [];
//const _TODOS :TodoResponse = {todos: []};

const packageDef = protoLoader.loadSync(path.resolve(__dirname, PROTO_FILE));
const grpcObject = (grpc.loadPackageDefinition(packageDef) as unknown) as ProtoGrpcType;
const randomPackage = grpcObject.randomPackage;

function main() {
    const server = getServer();
    server.bindAsync(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
        if (err) {
            console.error(err);
            return;
        }

        console.log(`Your gRPC server started on port ${port}`);

        server.start()
    })
}

function getServer() {
    const server = new grpc.Server();
    server.addService(randomPackage.Random.service, {
        PingPong: (req, res) => {
            // req.request;
            console.log(req.request);
            res(null, { message: 'Pong' });
        },
        RandomNumber: (call) => {
            const { maxVal = 10 } = call.request;

            let count = 0
            const id = setInterval(() => {
                count = ++count;

                call.write({ num: Math.floor(Math.random() * maxVal) });

                if (count >= 10) {
                    clearInterval(id);
                    call.end();
                }

            }, 500)
        },
        TodoList: (call, callback) => {
            call.on('data', (chunk) => {
                TODOS.push(chunk)
                console.log(chunk)
            });

            call.on('end', () => {
                callback(null, {todos: TODOS})
            });
        }
    } as RandomHandlers);

    return server;
}

main();