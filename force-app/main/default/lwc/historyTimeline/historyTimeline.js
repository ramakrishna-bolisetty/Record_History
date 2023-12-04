import { LightningElement,api,wire,track } from 'lwc';
import getFieldHistory from '@salesforce/apex/ObjectHistoryController.getFieldHistory';
import getTrackedFields from '@salesforce/apex/ObjectHistoryController.getTrackedFields';

export default class HistoryTimeline extends LightningElement {
    @api recordId;
    @api objectApiName;
    mappedResults;
    displayMappedResults=[];
    totalDisplayResults=[];
    dataLoadError;
    hasError=true;
    showViewBtnFlag=true;
    fieldOptions=[];
    isSelected = false;

    get objectApiNameTitle(){
        return this.editFieldLabel(this.objectApiName)
    }

    get icon(){
        if(this.objectApiName.endsWith('__c')) return 'standard:connected_apps';
        else return 'standard:'+this.objectApiNameTitle.toLowerCase();
    }

    @wire(getFieldHistory,{
        recordId: '$recordId',
        objectApiName: '$objectApiName'
    })
    loadHistoryData({data,error}){
        if(data){
            this.mappedResults=data;
            this.displayMappedResults=[...this.mappedResults];
            this.setTotalDisplayResults();
            this.hasError=false;
        }
        else if(error){
            this.mappedResults=[];
            this.dataLoadError=error.message;
            this.hasError=true;
            this.showViewBtnFlag=false;
        }
    }

    @wire(getTrackedFields,{
        objectApiName:'$objectApiName'
    })
    loadTrackFields({data,error}){
        if(data){
            this.fieldOptions=data;
            this.hasError=false;
        }
        else if(error){
            this.hasError=true;
            this.dataLoadError=error.message || 'Some Error in loading data';
        }
    }


    editFieldLabel(fieldName){
        let idx=fieldName.indexOf('__');
        return (idx==-1)?fieldName:fieldName.slice(0,idx);
    }


    setTotalDisplayResults(){
        if(this.displayMappedResults.length>4){
            this.showViewBtnFlag=true;
            this.totalDisplayResults=[...this.displayMappedResults.slice(0,4)];
        }
        else{
            this.showViewBtnFlag=false;
            this.totalDisplayResults=[...this.displayMappedResults];
        }
    }
        
    searchHandler(event) {
        let searchTerm = event.target.value;
        this.displayMappedResults=[...this.mappedResults];
        if(searchTerm!='All'){
            this.displayMappedResults=[...this.mappedResults.filter(([key,records])=>{
                return records.some(record=>record.Field===searchTerm);
            })];
        }
        if(!this.displayMappedResults.length){
            this.hasError=true;
            this.dataLoadError='No Data';
            this.showViewBtnFlag=false;
        }
        else{
            this.hasError=false;
            this.showViewBtnFlag=true;
        }
        this.setTotalDisplayResults();
    }

    viewMoreHandler(){
        if(!this.isSelected){
            this.totalDisplayResults=[...this.displayMappedResults];    
        }
        else{
            this.totalDisplayResults=[...this.displayMappedResults.slice(0,4)];
        }
        this.isSelected = !this.isSelected;
    }
}