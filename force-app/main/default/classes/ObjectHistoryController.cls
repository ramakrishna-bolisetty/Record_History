public class ObjectHistoryController {
    
    public static List<List<Object>> groupRecordsByDate(List<SObject> historyData){
        Map<Datetime, List<SObject>> groupedHistoryData = new Map<Datetime, List<SObject>>();
        for (SObject historyRecord : historyData) {
            Datetime createdDate = (Datetime)historyRecord.get('CreatedDate');
            if (!groupedHistoryData.containsKey(createdDate)) {
                groupedHistoryData.put(createdDate, new List<SObject>());
            }
            groupedHistoryData.get(createdDate).add(historyRecord);
        }
        
        List<List<Object>> result = new List<List<Object>>();
        for(Datetime date1 : groupedHistoryData.keySet()) {
            List<SObject> records = groupedHistoryData.get(date1);
            result.add(new List<Object>{ date1, records });
        }
        return result;
    }

    @AuraEnabled(cacheable=true)
    public static List<List<Object>> getFieldHistory(Id recordId, String objectApiName){        
        String fieldHistoryObject=objectApiName;
        if(objectApiName.endsWith('__c')){
            fieldHistoryObject=fieldHistoryObject.replace('__c','__History');
            objectApiName='Parent';
        } 
        else{
            fieldHistoryObject+='History';
        }

        String query='SELECT Id, Field, OldValue, NewValue, CreatedDate, CreatedById ' +
        'FROM ' + fieldHistoryObject +
        ' WHERE '+objectApiName+'Id = :recordId' +' AND Field!=\'created\' '+
        'ORDER BY CreatedDate DESC' ;
        List<SObject> historyData=Database.query(query);
        return groupRecordsByDate(historyData);
    }


    public static void setFieldOptions(List<FieldDefinition> trackedFields,List<Map<String,String>> trackedFieldOptions){
        for(FieldDefinition field:trackedFields){
            String fieldLabel=field.QualifiedApiName;
            if(fieldLabel.endsWith('__c')){
                fieldLabel=fieldLabel.replace('__c','');
            }
            trackedFieldOptions.add(
                new Map<String,String>{
                    'label'=>fieldLabel,
                    'value'=>field.QualifiedApiName
                }
            );
        }

        trackedFieldOptions.add(new Map<String,String>{
            'label'=>'All',
            'value'=>'All'
        });
    }
    
    @AuraEnabled(cacheable=true)
    public static List<Map<String,String>> getTrackedFields(String objectApiName){
        List<Map<String,String>> trackedFieldOptions=new List<Map<String,String>>();

        List<FieldDefinition> trackedFields=[
            SELECT QualifiedApiName
            FROM FieldDefinition
            WHERE EntityDefinition.QualifiedApiName =:objectApiName AND IsFieldHistoryTracked = true
        ];

        setFieldOptions(trackedFields,trackedFieldOptions);
        return trackedFieldOptions;
    }
}