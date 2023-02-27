namespace stats {
    export class StatRow extends core.DataComponent {


        constructor(dm: data.DataModel) {
            super(dm, "tr");
        }

        protected render(): void {
            this.addStyle("stats-StatRow");

            this.appendChild(new CharCell(this.model));

            for (const c of this.model.getChildren()) {
                this.appendChild(new StatCell(c));
            }
        }

    }
}