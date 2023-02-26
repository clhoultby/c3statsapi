namespace core {

    export class Component {

        protected element: HTMLElement;

        public parent: false | Component;
        
        public children: Component[];

        constructor(elementType: string = "div") {
            this.element = document.createElement(elementType);
            this.children = [];
        }

        public getElement(): HTMLElement {
            return this.element;
        }

        public appendChild(child: Component): void {
            child.render();
            child.parent = this;
            this.children.push(child);
            
            this.element.appendChild(child.getElement());
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