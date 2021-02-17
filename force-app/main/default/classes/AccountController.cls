public with sharing class AccountController {
    public AccountController() {

    }

    @AuraEnabled
    public static List<Account> retrieveAccountRecords(){
        try {
            return [
                select id, name, owner.name, phone, website, AnnualRevenue 
                    from Account where Industry = 'Financial Services' with SECURITY_ENFORCED
            ];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}