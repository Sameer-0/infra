class SimpleAlert {

    constructor() {
        this.closeElem = null;
        this.positiveElem = null;
        this.negativeElem = null;
    } 


    alert(obj) {

        console.log(">>>>>>>>>>>>> CALLING ALERT FUNC");
        
        this.removeAlert();

        let alertElem = document.createElement('div');
        alertElem.setAttribute('class', `simple-alert alert ${obj.type}`);
        let list = ``;
      
        for (let ele of  obj.message){
            for (let key in ele){
                list += `<li>${key}${ele[key]}</li>`
            }
         }

        alertElem.innerHTML = `
                <div class="header d-flex justify-content-between align-item-center" >
                    <h4 class='d-flex align-item-center'><i class="fa-solid fa-circle-exclamation me-3"></i> <p class="title">${obj.title}</p></h4>
                   
                    <i class="fa-solid fa-xmark simple-alert-close"></i>
                </div>
                <div class="body"><ul>
                    ${list}
                </ul></div> 
                <div class="footer">
                    ${obj.buttons.positive ? `<button class="positive">${obj.buttons.positive.text}</button>` : ''}
                    ${obj.buttons.negative ? `<button class="negative">${obj.buttons.negative.text}</button>` : ''}
                </div>   
        `

        let backdrop = document.createElement('div');
        backdrop.setAttribute('class', 'simple-alert-backdrop');

        document.body.appendChild(alertElem);
        document.body.appendChild(backdrop);

        this.closeElem = document.querySelector('.simple-alert .simple-alert-close');
        this.positiveElem = document.querySelector('.simple-alert .positive');
        this.negativeElem = document.querySelector('.simple-alert .negative');

        this.positiveCallbackFn = obj.buttons.positive.action;
        this.negativeCallbackFn = obj.buttons.negative.action;

        this.initEvents();

    }

    removeAlert() {
        if(document.querySelector('.simple-alert')) {
            document.querySelector('.simple-alert').remove();
        }

        if(document.querySelector('.simple-alert-backdrop')) {
            document.querySelector('.simple-alert-backdrop').remove();
        }
    }

    initEvents() {

        this.closeElem.addEventListener('click', () => {
            this.removeAlert();
        });

        this.positiveElem.addEventListener('click', () => {
            this.positiveCallbackFn();
        })

        this.negativeElem.addEventListener('click', () => {
            console.log('close working')
            this.negativeCallbackFn();
        })
        
    }

}

