namespace data {

    export interface Msg {
        msgType: number
        topic: string
    }

    export interface Snapshot extends Msg {
        data: Map<string, string>
        children: InsertMsg[];
    }

    export interface InsertMsg extends Msg {
        parentTopic: string,
        data: Map<string, string>
        children: InsertMsg[];
    }

    export interface UpdateMsg extends Msg {
        data: Map<string, string>
    }

    export interface DeleteMsg extends Msg {

    }


    export interface IDataModelDelegate {
        insert(model: DataModel): void;
        update(data: Map<string, string>): void;
        delete(): void;
    }

    export class DataModel {

        private delegates: IDataModelDelegate[];

        private children: DataModel[];

        private parent: false | DataModel;

        constructor(public topic: string, public data: Map<string, string>) {
            this.children = [];
            this.delegates = [];
        }

        public addDelegate(d: IDataModelDelegate): void {
            this.delegates.push(d);
        }

        public removeDelete(d: IDataModelDelegate): void {
            const i = this.delegates.indexOf(d); 
            if (i === -1) {
                return;
            }

            this.delegates.splice(i, 1);
        }


        public getChildren(): DataModel[] {
            return this.children;
        }

        public childDeleted(child: DataModel): void {
            const i = this.children.indexOf(child);
            if (i === -1) {
                return
            }

            this.children.splice(i, 1);
        }

        public insert(child: DataModel) {
            this.children.push(child);
            child.parent = this;

            for (const d of this.delegates) {
                d.insert(child);
            }
        }

        public delete(): void {
            for (const d of this.delegates) {
                d.delete();
            }

            this.parent && this.parent.childDeleted(this);
            this.parent = false;
        }


        public update(updateData: Map<string, string>): void {

            for (const k in updateData) {
                this.data[k] = updateData[k];
            }

            for (const d of this.delegates) {
                d.update(updateData);
            }
        }
    }
}