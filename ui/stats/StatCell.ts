namespace stats {

    export class StatCell extends core.DataComponent {

        constructor(dm: data.DataModel) {
            super(dm, "textarea");
        }

        protected element: HTMLTextAreaElement;

        protected render(): void {
            this.addStyle("stats-StatCell");
           
            this.element.value = this.model.data["value"];
            this.element.onchange =  e => this.onChangeHandler(e);
        }

        public update(data: Lookup<string>): void {
            this.setText(data["value"]);
            this.addStyle("stats-StatCell-updated");

            window.setTimeout(()=> {
                this.removeStyle("stats-StatCell-updated");
            }, 1000)

        }

        private onChangeHandler(e: Event): void {
            const v = this.element.value && this.element.value.trim();

            if (!v) {
                this.element.value = this.model.data["value"];
                return;

            } else if (v == this.model.data["value"]) {
                return;
            }

            const msg = data.newUpdateMsg(this.model.topic, {"value": v});
            this.sendUpdate(msg);
        }

    }
}