namespace SocialCoordinationApp.Services;

public record SeedResult(int UsersCreated, int GroupsCreated, int HangoutsCreated, int FriendshipsCreated);

public interface ISeedService
{
    Task<SeedResult> SeedAsync();
}