namespace stats {

    export class Table extends core.DataComponent {

        constructor(dm: data.DataModel) {
            super(dm);
        }

        protected render() {
            this.addStyle("stats-Table");

            const children = this.model.getChildren();

            const statDescColumn = new StatDescColumn(children[0]);
            this.appendChild(statDescColumn);

            for (let i = 1; i <  children.length; i++) {
                this.appendChild(new CharColumn(children[i]));
            }
        }
    }
}