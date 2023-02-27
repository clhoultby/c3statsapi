namespace core {

    export class Component {

        private styles: string[];
        private commitStyles: boolean;

        protected element: HTMLElement;

        public parent: false | Component;

        public children: Component[];

        constructor(elementType: string = "div") {
            this.element = document.createElement(elementType);
            this.children = [];
            this.styles = [];
        }

        public setText(text: string): void {
            window.requestAnimationFrame(() => {
                this.element.innerText = text;
            });
        }

        public addStyle(style: string): void {
            this.styles.push(style);

            if (this.commitStyles) {
                return
            }

            this.commitStyles = true;

            window.requestAnimationFrame(() => {
                this.element.setAttribute("class", this.styles.join(""));
                this.commitStyles = false;
            });
        }

        public getElement(): HTMLElement {
            return this.element;
        }

        public appendChild(child: Component): void {
            child.render();
            child.parent = this;
            this.children.push(child);

            window.requestAnimationFrame(() => {
                this.element.appendChild(child.getElement());
            });
        }


        public removeChild(child: Component): void {
            if (child.parent !== this) {
                console.error("removeChild called for an element that is not a child of target");
                return;
            }

            child.dispose();
            child.parent = false;
            this.children.splice(this.children.indexOf(child), 1)

            this.element.removeChild(child.getElement());
        }

        protected render(): void { }


        protected dispose(): void {
            for (const c of this.children) {
                c.dispose();
            }
        }

    }

}