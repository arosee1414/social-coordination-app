namespace SocialCoordinationApp.Services;

public record SeedResult(int UsersCreated, int GroupsCreated, int HangoutsCreated);

public interface ISeedService
{
    Task<SeedResult> SeedAsync();
}