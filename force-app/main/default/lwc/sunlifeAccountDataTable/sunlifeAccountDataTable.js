import { LightningElement} from 'lwc';
import GETACCOUNTLIST from '@salesforce/apex/AccountController.retrieveAccountRecords';
import {updateRecord} from 'lightning/uiRecordApi';

import {ShowToastEvent} from 'lightning/platformShowToastEvent';

const columns = [
    {label: 'Account Name', fieldName: 'linkName',sortable: true, type: 'url',
             typeAttributes: {label: { fieldName: 'AccountName' }, editable:'true',  target: '_blank'}},
    { label: 'Account Owner', fieldName: 'Owner', sortable:'true' },
    { label: 'Phone', fieldName: 'Phone', type: 'phone', editable: true },
    { label: 'Website', fieldName: 'Website', type: 'url', editable: true },
    { label: 'Annual Revenue', fieldName: 'AnnualRevenue', type: 'currency', editable: true },
];
export default class SunlifeAccountDataTable extends LightningElement {
    data = [];
    unfilteredData = [];
    columns = columns;
    rowOffset = 0;
    tempValues = [];
    defaultSortDirection = 'asc';
    sortDirection = 'asc';
    sortedBy;
    searchKey;

    connectedCallback(){
        this.init();
    }
    init(){
        GETACCOUNTLIST().then(
            result => {
                if(result){
                    let currentData = [];
                    result.forEach(element => {
                        let rowData = {};
                        if(element){
                            rowData.Id = element.Id;
                            rowData.AccountName = element.Name;
                            rowData.linkName = '/'+element.Id;
                            rowData.Owner = element.Owner.Name;
                            rowData.Phone = element.Phone;
                            rowData.Website = element.Website;
                            rowData.AnnualRevenue = element.AnnualRevenue;
                            currentData.push(rowData);
                        }
                    });
                    
                    this.data = currentData;
                    this.unfilteredData = this.data;
                }
            }).catch(error=>{
                console.log(error);
            });
    }

    handleSave(event){
        this.tempValues = event.detail.draftValues;
        const recordInputs = this.tempValues.slice().map(draft => {
            const fields = Object.assign({}, draft);
            return {fields};
        });
        const promises = recordInputs.map(recordInput => updateRecord(recordInput));
        Promise.all(promises).then(res => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Account(s) updated',
                    variant: 'success'
                })
            );
            this.tempValues = [];
            this.init();
        }).catch(error => {
            console.log(error);
        });


    }

    sortHandle(event){
        const {fieldName: sortedBy, sortDirection} = event.detail;
        const cloneData = [...this.data];
        cloneData.sort(this.sortBy(sortedBy, sortDirection==='asc'?1:-1));
        this.data = cloneData;
        this.sortDirection = sortDirection;
        this.sortedBy = sortedBy;
    }

    sortBy(field, reverse, primer){
        const key = primer?function(x){
            return primer(x[field]);
        }:function(x){
            return x[field];
        };
        return function(a,b){
            a = key(a);
            b = key(b);
            return reverse * ((a>b) - (b>a));
        }
    }

    handleKeywordChange(event){
        let searchKey = event.target.value;
        let allData = this.data;
        if(searchKey){
            var filtereddata = allData.filter(word => (!searchKey) || word.Name.toLowerCase().indexOf(searchKey.toLowerCase()) > -1);
            this.data = filtereddata;
        }else if('' == valToSearch){
            this.data = this.unfilteredData;
        }
    }
}