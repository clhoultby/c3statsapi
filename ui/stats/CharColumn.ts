namespace stats {

    export class CharColumn extends core.DataComponent {

        protected render(): void {
            this.addStyle("stats-CharColumn");

            const header = new CharCell(this.model);
            this.appendChild(header);

            for (const c of this.model.getChildren()) {
                this.appendChild(new StatCell(c));
            }
        }

    }
}