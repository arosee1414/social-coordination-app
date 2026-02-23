using Microsoft.Azure.Cosmos;
using SocialCoordinationApp.Infrastructure;
using SocialCoordinationApp.Models.Domain;
using SocialCoordinationApp.Models.Enums;

namespace SocialCoordinationApp.Services;

public class SeedService : ISeedService
{
    private readonly ICosmosContext _cosmosContext;
    private readonly ILogger<SeedService> _logger;

    // The real Clerk user ID for the test user
    private const string RealUserId = "user_3A2C64uTqFecw5hrDfTAugiid0s";

    // Fake friend user IDs
    private const string FriendId1 = "seed-friend-01";
    private const string FriendId2 = "seed-friend-02";
    private const string FriendId3 = "seed-friend-03";
    private const string FriendId4 = "seed-friend-04";
    private const string FriendId5 = "seed-friend-05";

    // Group IDs
    private const string GroupId1 = "seed-group-01";
    private const string GroupId2 = "seed-group-02";
    private const string GroupId3 = "seed-group-03";

    // Hangout IDs
    private const string HangoutId1 = "seed-hangout-01";
    private const string HangoutId2 = "seed-hangout-02";
    private const string HangoutId3 = "seed-hangout-03";
    private const string HangoutId4 = "seed-hangout-04";

    public SeedService(ICosmosContext cosmosContext, ILogger<SeedService> logger)
    {
        _cosmosContext = cosmosContext;
        _logger = logger;
    }

    public async Task<SeedResult> SeedAsync()
    {
        _logger.LogInformation("Starting database seed...");

        var usersCreated = await SeedUsersAsync();
        var groupsCreated = await SeedGroupsAsync();
        var hangoutsCreated = await SeedHangoutsAsync();

        _logger.LogInformation(
            "Seed complete: {Users} users, {Groups} groups, {Hangouts} hangouts created",
            usersCreated, groupsCreated, hangoutsCreated);

        return new SeedResult(usersCreated, groupsCreated, hangoutsCreated);
    }

    private async Task<int> SeedUsersAsync()
    {
        var now = DateTime.UtcNow;
        var users = new List<UserRecord>
        {
            new()
            {
                Id = RealUserId,
                Email = "testuser@example.com",
                FirstName = "Alex",
                LastName = "Rose",
                ProfileImageUrl = null,
                CreatedAt = now.AddDays(-30),
                UpdatedAt = now
            },
            new()
            {
                Id = FriendId1,
                Email = "sarah.chen@example.com",
                FirstName = "Sarah",
                LastName = "Chen",
                ProfileImageUrl = null,
                CreatedAt = now.AddDays(-28),
                UpdatedAt = now
            },
            new()
            {
                Id = FriendId2,
                Email = "marcus.johnson@example.com",
                FirstName = "Marcus",
                LastName = "Johnson",
                ProfileImageUrl = null,
                CreatedAt = now.AddDays(-25),
                UpdatedAt = now
            },
            new()
            {
                Id = FriendId3,
                Email = "emma.wilson@example.com",
                FirstName = "Emma",
                LastName = "Wilson",
                ProfileImageUrl = null,
                CreatedAt = now.AddDays(-20),
                UpdatedAt = now
            },
            new()
            {
                Id = FriendId4,
                Email = "jay.patel@example.com",
                FirstName = "Jay",
                LastName = "Patel",
                ProfileImageUrl = null,
                CreatedAt = now.AddDays(-15),
                UpdatedAt = now
            },
            new()
            {
                Id = FriendId5,
                Email = "olivia.martinez@example.com",
                FirstName = "Olivia",
                LastName = "Martinez",
                ProfileImageUrl = null,
                CreatedAt = now.AddDays(-10),
                UpdatedAt = now
            }
        };

        int created = 0;
        foreach (var user in users)
        {
            try
            {
                await _cosmosContext.UsersContainer.CreateItemAsync(user, new PartitionKey(user.Id));
                created++;
                _logger.LogInformation("Created user: {UserId} ({Name})", user.Id, $"{user.FirstName} {user.LastName}");
            }
            catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.Conflict)
            {
                _logger.LogWarning("User {UserId} already exists, skipping", user.Id);
            }
        }

        return created;
    }

    private async Task<int> SeedGroupsAsync()
    {
        var now = DateTime.UtcNow;
        var groups = new List<GroupRecord>
        {
            new()
            {
                Id = GroupId1,
                Name = "Weekend Warriors",
                Emoji = "⚔️",
                Description = "Friends who hang out on weekends",
                CreatedByUserId = RealUserId,
                Members = new List<GroupMember>
                {
                    new() { UserId = RealUserId, Role = GroupMemberRole.Admin, JoinedAt = now.AddDays(-20) },
                    new() { UserId = FriendId1, Role = GroupMemberRole.Member, JoinedAt = now.AddDays(-19) },
                    new() { UserId = FriendId2, Role = GroupMemberRole.Member, JoinedAt = now.AddDays(-18) },
                    new() { UserId = FriendId3, Role = GroupMemberRole.Member, JoinedAt = now.AddDays(-17) }
                },
                CreatedAt = now.AddDays(-20),
                UpdatedAt = now
            },
            new()
            {
                Id = GroupId2,
                Name = "Foodies Club",
                Emoji = "🍕",
                Description = "We love trying new restaurants",
                CreatedByUserId = FriendId1,
                Members = new List<GroupMember>
                {
                    new() { UserId = FriendId1, Role = GroupMemberRole.Admin, JoinedAt = now.AddDays(-15) },
                    new() { UserId = RealUserId, Role = GroupMemberRole.Member, JoinedAt = now.AddDays(-14) },
                    new() { UserId = FriendId4, Role = GroupMemberRole.Member, JoinedAt = now.AddDays(-13) },
                    new() { UserId = FriendId5, Role = GroupMemberRole.Member, JoinedAt = now.AddDays(-12) }
                },
                CreatedAt = now.AddDays(-15),
                UpdatedAt = now
            },
            new()
            {
                Id = GroupId3,
                Name = "Movie Nights",
                Emoji = "🎬",
                Description = "Weekly movie night crew",
                CreatedByUserId = RealUserId,
                Members = new List<GroupMember>
                {
                    new() { UserId = RealUserId, Role = GroupMemberRole.Admin, JoinedAt = now.AddDays(-10) },
                    new() { UserId = FriendId2, Role = GroupMemberRole.Member, JoinedAt = now.AddDays(-9) },
                    new() { UserId = FriendId5, Role = GroupMemberRole.Member, JoinedAt = now.AddDays(-8) }
                },
                CreatedAt = now.AddDays(-10),
                UpdatedAt = now
            }
        };

        int created = 0;
        foreach (var group in groups)
        {
            try
            {
                await _cosmosContext.GroupsContainer.CreateItemAsync(group, new PartitionKey(group.CreatedByUserId));
                created++;
                _logger.LogInformation("Created group: {GroupId} ({Name})", group.Id, group.Name);
            }
            catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.Conflict)
            {
                _logger.LogWarning("Group {GroupId} already exists, skipping", group.Id);
            }
        }

        return created;
    }

    private async Task<int> SeedHangoutsAsync()
    {
        var now = DateTime.UtcNow;
        var hangouts = new List<HangoutRecord>
        {
            // Upcoming hangout - happening soon
            new()
            {
                Id = HangoutId1,
                Title = "Coffee & Catch Up",
                Emoji = "☕",
                Description = "Let's grab coffee and catch up on life!",
                Location = "Blue Bottle Coffee",
                StartTime = now.AddHours(3),
                EndTime = now.AddHours(5),
                CreatedByUserId = RealUserId,
                GroupId = GroupId1,
                Attendees = new List<HangoutAttendee>
                {
                    new() { UserId = RealUserId, RsvpStatus = RSVPStatus.Going, RespondedAt = now.AddDays(-1) },
                    new() { UserId = FriendId1, RsvpStatus = RSVPStatus.Going, RespondedAt = now.AddDays(-1) },
                    new() { UserId = FriendId2, RsvpStatus = RSVPStatus.Maybe, RespondedAt = now.AddHours(-12) },
                    new() { UserId = FriendId3, RsvpStatus = RSVPStatus.Pending, RespondedAt = null }
                },
                Status = HangoutStatus.Active,
                CreatedAt = now.AddDays(-2),
                UpdatedAt = now
            },
            // Upcoming hangout - tomorrow
            new()
            {
                Id = HangoutId2,
                Title = "Pizza Night",
                Emoji = "🍕",
                Description = "Trying out the new pizza place downtown",
                Location = "Joe's Pizza",
                StartTime = now.AddDays(1).AddHours(2),
                EndTime = now.AddDays(1).AddHours(4),
                CreatedByUserId = FriendId1,
                GroupId = GroupId2,
                Attendees = new List<HangoutAttendee>
                {
                    new() { UserId = FriendId1, RsvpStatus = RSVPStatus.Going, RespondedAt = now.AddDays(-3) },
                    new() { UserId = RealUserId, RsvpStatus = RSVPStatus.Going, RespondedAt = now.AddDays(-2) },
                    new() { UserId = FriendId4, RsvpStatus = RSVPStatus.Going, RespondedAt = now.AddDays(-2) },
                    new() { UserId = FriendId5, RsvpStatus = RSVPStatus.NotGoing, RespondedAt = now.AddDays(-1) }
                },
                Status = HangoutStatus.Active,
                CreatedAt = now.AddDays(-3),
                UpdatedAt = now
            },
            // Upcoming hangout - this weekend
            new()
            {
                Id = HangoutId3,
                Title = "Movie Marathon",
                Emoji = "🎬",
                Description = "Lord of the Rings extended edition marathon!",
                Location = "My Place",
                StartTime = now.AddDays(3),
                EndTime = now.AddDays(3).AddHours(10),
                CreatedByUserId = RealUserId,
                GroupId = GroupId3,
                Attendees = new List<HangoutAttendee>
                {
                    new() { UserId = RealUserId, RsvpStatus = RSVPStatus.Going, RespondedAt = now.AddDays(-1) },
                    new() { UserId = FriendId2, RsvpStatus = RSVPStatus.Going, RespondedAt = now.AddDays(-1) },
                    new() { UserId = FriendId5, RsvpStatus = RSVPStatus.Maybe, RespondedAt = now.AddHours(-6) }
                },
                Status = HangoutStatus.Active,
                CreatedAt = now.AddDays(-5),
                UpdatedAt = now
            },
            // Upcoming hangout - no group
            new()
            {
                Id = HangoutId4,
                Title = "Park Hangout",
                Emoji = "🌳",
                Description = "Chill afternoon at the park. Bring frisbees!",
                Location = "Central Park",
                StartTime = now.AddDays(5),
                EndTime = now.AddDays(5).AddHours(3),
                CreatedByUserId = FriendId3,
                GroupId = null,
                Attendees = new List<HangoutAttendee>
                {
                    new() { UserId = FriendId3, RsvpStatus = RSVPStatus.Going, RespondedAt = now.AddDays(-1) },
                    new() { UserId = RealUserId, RsvpStatus = RSVPStatus.Pending, RespondedAt = null },
                    new() { UserId = FriendId1, RsvpStatus = RSVPStatus.Going, RespondedAt = now.AddHours(-3) },
                    new() { UserId = FriendId4, RsvpStatus = RSVPStatus.Maybe, RespondedAt = now.AddHours(-2) }
                },
                Status = HangoutStatus.Active,
                CreatedAt = now.AddDays(-1),
                UpdatedAt = now
            }
        };

        int created = 0;
        foreach (var hangout in hangouts)
        {
            try
            {
                await _cosmosContext.HangoutsContainer.CreateItemAsync(hangout, new PartitionKey(hangout.CreatedByUserId));
                created++;
                _logger.LogInformation("Created hangout: {HangoutId} ({Title})", hangout.Id, hangout.Title);
            }
            catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.Conflict)
            {
                _logger.LogWarning("Hangout {HangoutId} already exists, skipping", hangout.Id);
            }
        }

        return created;
    }
}