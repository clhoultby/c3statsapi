namespace characteroverview {

    export class StatsContainer extends core.DataComponent {

        private baseStyle = "co-StatsContainer";

        constructor(model: data.DataModel, private startIndex: number, private endIndex: number) {
            super(model);
        }

        protected render(): void {
            this.addStyle(this.baseStyle);

            for (let i = this.startIndex; i < this.endIndex; i++) {
                this.appendChild(new Stat(this.model.getChildren()[i]));
            }

        }

    }
}