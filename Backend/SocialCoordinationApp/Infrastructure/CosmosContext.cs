using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Options;
using SocialCoordinationApp.Configuration;

namespace SocialCoordinationApp.Infrastructure;

public class CosmosContext : ICosmosContext
{
    private readonly CosmosClient _client;
    private readonly CosmosConfiguration _config;
    private Database? _database;

    public Container UsersContainer { get; private set; } = null!;
    public Container GroupsContainer { get; private set; } = null!;
    public Container HangoutsContainer { get; private set; } = null!;
    public Container FriendshipsContainer { get; private set; } = null!;
    public Container NotificationsContainer { get; private set; } = null!;

    public CosmosContext(CosmosClient client, IOptions<CosmosConfiguration> config)
    {
        _client = client;
        _config = config.Value;
    }

    public async Task InitializeAsync()
    {
        var dbResponse = await _client.CreateDatabaseIfNotExistsAsync(_config.DatabaseName);
        _database = dbResponse.Database;

        var usersResponse = await _database.CreateContainerIfNotExistsAsync(
            new ContainerProperties("Users", "/id")
        );
        UsersContainer = usersResponse.Container;

        var groupsResponse = await _database.CreateContainerIfNotExistsAsync(
            new ContainerProperties("Groups", "/createdByUserId")
        );
        GroupsContainer = groupsResponse.Container;

        var hangoutsResponse = await _database.CreateContainerIfNotExistsAsync(
            new ContainerProperties("Hangouts", "/createdByUserId")
        );
        HangoutsContainer = hangoutsResponse.Container;

        var friendshipsResponse = await _database.CreateContainerIfNotExistsAsync(
            new ContainerProperties("Friendships", "/userId")
        );
        FriendshipsContainer = friendshipsResponse.Container;

        var notificationsResponse = await _database.CreateContainerIfNotExistsAsync(
            new ContainerProperties("Notifications", "/recipientUserId")
            {
                DefaultTimeToLive = -1
            }
        );
        NotificationsContainer = notificationsResponse.Container;
    }
}