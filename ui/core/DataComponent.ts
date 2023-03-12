namespace core {

    import DataModel = data.DataModel;
    import IDataModelDelegate = data.IDataModelDelegate;

    export abstract class DataComponent extends Component implements IDataModelDelegate {

        constructor(protected model: DataModel, elementType: string = "div") {
            super(elementType);
            model.addDelegate(this);
        }

        public insert(model: DataModel): void {

        }

        public update(data: Lookup<string>): void {

        }

        public delete(): void {

        }


        protected sendUpdate( u: data.UpdateMsg): void {
            Locator.connection.sendMsg(u);
        }

        protected dispose(): void {
            this.model.removeDelegate(this);
            super.dispose();
        }


    }

}