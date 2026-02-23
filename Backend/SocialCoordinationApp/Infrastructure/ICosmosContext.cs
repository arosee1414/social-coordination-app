using Microsoft.Azure.Cosmos;

namespace SocialCoordinationApp.Infrastructure;

public interface ICosmosContext
{
    Container UsersContainer { get; }
    Container GroupsContainer { get; }
    Container HangoutsContainer { get; }
    Task InitializeAsync();
}