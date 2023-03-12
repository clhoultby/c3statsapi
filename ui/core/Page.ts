namespace core {

    export class Page extends core.Component implements IPage {
        
        protected render(): void {
            this.addStyle("core-Page");
        }
        
        public navigateTo(topic: string) {
            
        }
    }

}