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

        public update(data: Map<string, string>): void {

        }

        public delete(): void {

        }


    }

}