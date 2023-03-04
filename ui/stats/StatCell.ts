namespace stats {

    export class StatCell extends core.DataComponent {

        constructor(dm: data.DataModel) {
            super(dm, "input");
        }

        protected element: HTMLTextAreaElement;

        protected render(): void {
            this.addStyle("stats-StatCell");

            this.element.setAttribute("inputmode", "numeric");
           
            this.element.value = this.model.data["value"];
            this.element.onblur =  e => this.onChangeHandler(e);
            this.element.onfocus = e => this.element.value = "";
        }

        public update(data: Lookup<string>): void {
            this.setText(data["value"]);
            this.addStyle("stats-StatCell-updated");

            window.setTimeout(()=> {
                this.removeStyle("stats-StatCell-updated");
            }, 1000)

        }

        public setText(text: string): void {
            window.requestAnimationFrame(() => {
                this.element.value = text;
            });
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