namespace SocialCoordinationApp.Services;

public record SeedResult(int UsersCreated, int GroupsCreated, int HangoutsCreated, int FriendshipsCreated, int NotificationsCreated);

public interface ISeedService
{
    Task<SeedResult> SeedAsync();
}