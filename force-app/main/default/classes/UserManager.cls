public class UserManager {
    @AuraEnabled(cacheable=true)
    
    public static String getUserNameById(Id userId){
        User user=[SELECT Name FROM User WHERE Id=:userId LIMIT 1];
        return user.Name;
    }
}