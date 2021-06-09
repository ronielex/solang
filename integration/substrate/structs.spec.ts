import expect from 'expect';
import { gasLimit, createConnection, deploy, transaction, aliceKeypair, } from './index';
import { ContractPromise } from '@polkadot/api-contract';
import { ApiPromise } from '@polkadot/api';

describe('Deploy struct contract and test', () => {
    let conn: ApiPromise;

    before(async function () {
        conn = await createConnection();
    });

    after(async function () {
        await conn.disconnect();
    });

    it('structs', async function () {
        this.timeout(50000);

        const alice = aliceKeypair();

        let deployed_contract = await deploy(conn, alice, 'structs.contract');

        let contract = new ContractPromise(conn, deployed_contract.abi, deployed_contract.address);

        const tx1 = contract.tx.setFoo1({ gasLimit });

        await transaction(tx1, alice);

        let res1 = await contract.query.getBothFoos(alice.address, {});

        expect(res1.output?.toJSON()).toStrictEqual([
            {
                "f1": "bar2",
                "f2": "0x446f6e277420636f756e7420796f757220636869636b656e73206265666f72652074686579206861746368",
                "f3": -102,
                "f4": "0xedaeda",
                "f5": "You can't have your cake and eat it too",
                "f6": { "in1": true, "in2": "There are other fish in the sea" }
            },
            {
                "f1": "bar1",
                "f2": "0x",
                "f3": 0,
                "f4": "0x000000",
                "f5": "",
                "f6": { "in1": false, "in2": "" }
            }
        ]);

        const tx2 = contract.tx.setFoo2({ gasLimit },
            {
                "f1": "bar2",
                "f2": "0xb52b073595ccb35eaebb87178227b779",
                "f3": -123112321,
                "f4": "0x123456",
                "f5": "Barking up the wrong tree",
                "f6": {
                    "in1": true, "in2": "Drive someone up the wall"
                }
            },
            "nah"
        );

        await transaction(tx2, alice);

        if (1) {
            let res3 = await contract.query.getFoo(alice.address, {}, false);

            expect(res3.output?.toJSON()).toStrictEqual(
                {
                    "f1": "bar2",
                    "f2": "0xb52b073595ccb35eaebb87178227b779",
                    "f3": -123112321,
                    "f4": "0x123456",
                    "f5": "Barking up the wrong tree",
                    "f6": { "in1": true, "in2": "nah" }
                },
            );
        }

        let res2 = await contract.query.getBothFoos(alice.address, {});

        expect(res2.output?.toJSON()).toStrictEqual([
            {
                "f1": "bar2",
                "f2": "0x446f6e277420636f756e7420796f757220636869636b656e73206265666f72652074686579206861746368",
                "f3": -102,
                "f4": "0xedaeda",
                "f5": "You can't have your cake and eat it too",
                "f6": { "in1": true, "in2": "There are other fish in the sea" }
            },
            {
                "f1": "bar2",
                "f2": "0xb52b073595ccb35eaebb87178227b779",
                "f3": -123112321,
                "f4": "0x123456",
                "f5": "Barking up the wrong tree",
                "f6": { "in1": true, "in2": "nah" }
            }
        ]);

        const tx3 = contract.tx.deleteFoo({ gasLimit }, true);

        await transaction(tx3, alice);

        let res3 = await contract.query.getFoo(alice.address, {}, false);

        expect(res3.output?.toJSON()).toStrictEqual(
            {
                "f1": "bar2",
                "f2": "0xb52b073595ccb35eaebb87178227b779",
                "f3": -123112321,
                "f4": "0x123456",
                "f5": "Barking up the wrong tree",
                "f6": { "in1": true, "in2": "nah" }
            },
        );

        const tx4 = contract.tx.structLiteral({ gasLimit });

        await transaction(tx4, alice);

        let res4 = await contract.query.getFoo(alice.address, {}, true);

        expect(res4.output?.toJSON()).toStrictEqual(
            {
                "f1": "bar4",
                "f2": "0x537570657263616c6966726167696c697374696365787069616c69646f63696f7573",
                "f3": 64927,
                "f4": "0xe282ac",
                "f5": "Antidisestablishmentarianism",
                "f6": { "in1": true, "in2": "Pseudopseudohypoparathyroidism" },
            },
        );

        // it('arrays in account storage', async function () {
        //     this.timeout(50000);

        //     let conn = await establishConnection();

        //     // storage.sol needs 168 bytes on constructor, more for string data
        //     let prog = await conn.loadProgram("bundle.so", "arrays.abi", 4096);

        //     await prog.call_constructor(conn, 'arrays', []);

        //     let users = [];

        //     for (let i = 0; i < 3; i++) {
        //         let addr = '0x' + crypto.randomBytes(32).toString('hex');
        //         let name = `name${i}`;
        //         let id = crypto.randomBytes(4).readUInt32BE(0).toString();
        //         let perms: string[] = [];

        //         for (let j = 0; j < Math.random() * 3; j++) {
        //             let p = Math.floor(Math.random() * 8);

        //             perms.push(`${p}`);
        //         }

        //         await prog.call_function(conn, "addUser", [id, addr, name, perms]);


        //         users.push([
        //             name, addr, id, perms
        //         ]);
        //     }

        //     function returns(res: Object) {
        //         let arr = Object.values(res);
        //         let length = arr.pop()
        //         expect(arr.length).toEqual(length);
        //         return JSON.stringify(arr);
        //     }

        //     let user = users[Math.floor(Math.random() * users.length)];

        //     let res = returns(await prog.call_function(conn, "getUserById", [user[2]]));

        //     expect(res).toStrictEqual(JSON.stringify([user]));

        //     if (user[3].length > 0) {
        //         let perms = user[3];

        //         let p = perms[Math.floor(Math.random() * perms.length)];

        //         res = returns(await prog.call_function(conn, "hasPermission", [user[2], p]));

        //         expect(res).toBe(JSON.stringify([true]));
        //     }

        //     user = users[Math.floor(Math.random() * users.length)];

        //     res = returns(await prog.call_function(conn, "getUserByAddress", [user[1]]));

        //     expect(res).toStrictEqual(JSON.stringify([user]));

        //     await prog.call_function(conn, "removeUser", [user[2]]);

        //     res = returns(await prog.call_function(conn, "userExists", [user[2]]));

        //     expect(res).toBe(JSON.stringify([false]));
    });
});
