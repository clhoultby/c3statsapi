namespace core {

    import DataModel = data.DataModel;

    export class DataComponent extends Component {

        constructor(protected model: DataModel, elementType: string = "div") {
            super(elementType);
        }


    }

}