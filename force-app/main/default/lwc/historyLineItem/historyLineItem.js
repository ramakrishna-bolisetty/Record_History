import { LightningElement,api,track,wire } from 'lwc';
import getUserNameById from '@salesforce/apex/UserManager.getUserNameById';

export default class HistoryLineItem extends LightningElement {
    @api historyItem=null;
    @api editFieldLabel;
    timeLineClassToggle;
    timeLineClassName='slds-timeline__item_expandable slds-timeline__item_task ';
    iconStyle='utility:chevronright';
    userName='Unkown';

    get eventHistoryItem(){
        return this.historyItem;
    }
    get historyItemDate(){
        return this.eventHistoryItem[0] || null;
    };
    get historyItemObject(){
        return this.eventHistoryItem[1] || null;
    };
    get userId(){
        return this.historyItemObject[0].CreatedById;
    };
    get fieldsString(){
        let str='';
        let objectLength=this.historyItemObject.length;
        for(let i=0;i<objectLength;i++){
            str+=(this.editFieldLabel(this.historyItemObject[i].Field));
            if(i!=objectLength-1) str+=', ';
        }
        return str;
    };

    get formattedDate(){
        return this.formatDateTime(this.historyItemDate);
    }

    @wire(getUserNameById,{userId:'$userId'})  getUserName({data,error}){
        if(data){
            this.userName=data;
        }
        else if(error){
            this.userName='UnKnown';
        }
    }   
    
    
    
    formatDateTime(dateTimeString) {
        const options = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second:'2-digit',
            hour12: true,
        };
        console.log('date is -->'+dateTimeString);
    
        return new Date(dateTimeString).toLocaleString('en-US', options);
    }


    updateTimeLineClass(){
        if(!this.timeLineClassToggle){
            this.timeLineClassName+='slds-is-open'
            this.timeLineClassToggle=true;
            this.iconStyle='utility:chevrondown';
        }
        else {
            this.timeLineClassName='slds-timeline__item_expandable slds-timeline__item_task ';
            this.timeLineClassToggle=false;
            this.iconStyle='utility:chevronright';
        };
    }
}



















