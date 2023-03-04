namespace data {

    export interface Msg {
        msgType: number
        topic: string
    }

    export interface SnapshotMsg extends Msg {
        data: InsertMsg;
    }

    export interface InsertMsg extends Msg {
        parentTopic: string,
        data: Lookup<string>
        children: InsertMsg[];
    }

    export interface UpdateMsg extends Msg {
        data: Lookup<string>
    }

    export interface DeleteMsg extends Msg {

    }

    export interface IDataModelDelegate {
        insert(model: DataModel): void;
        update(data: Lookup<string>): void;
        delete(): void;
    }

    export function newUpdateMsg(topic: string, data: Lookup<string>): UpdateMsg {
        return {msgType: connection.MessageType.Update, topic, data};
    }

    export function newInsertMsg(topic: string, parentTopic: string, data: Lookup<string>, children: InsertMsg[]): InsertMsg {
        return {
            msgType: connection.MessageType.Insert, 
            topic,
            parentTopic,
            data, 
            children
        };
    }

    export function newDeleteMsg(topic: string): DeleteMsg {
        return {msgType: connection.MessageType.Delete, topic};
    }

}