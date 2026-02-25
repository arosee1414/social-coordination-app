using Microsoft.Azure.Cosmos;
using SocialCoordinationApp.Infrastructure;
using SocialCoordinationApp.Models.Domain;
using SocialCoordinationApp.Models.Enums;

namespace SocialCoordinationApp.Services;

public class SeedService : ISeedService
{
    private readonly ICosmosContext _cosmosContext;
    private readonly ILogger<SeedService> _logger;

    // Real Clerk user IDs
    private const string AlexId = "user_3A69U2QLogajjLg2fz5HYtY1d8z";       // Alexander Rosenthal (already exists — not seeded)
    private const string LaceyId = "user_3A8Zw5vouH1DKVysQEKa6Ly3zk4";       // Lacey Rubin
    private const string JordanId = "user_3A8a2DPscQOpsCm1MYXqCO7oEhD";      // Jordan Moldowsky
    private const string MattId = "user_3A8a57ZzP2OLpXWhPJSGGiIll2M";        // Matt Korn
    private const string PietroId = "user_3A8aANI59MPyhZGAO0ZbG3NE3yv";      // Pietro Buonfrisco
    private const string KirstinId = "user_3A8aCpmKLGn0NgM9nPei32UiL6R";     // Kirstin Cox
    private const string LukeId = "user_3A8aFuVqs6CYyepF5UWfep2CwL3";       // Luke Rosenthal
    private const string JakeId = "user_3A8aIYLpq5PosjzeaDKOxj4MHv0";       // Jake Rosenthal

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
        var friendshipsCreated = await SeedFriendshipsAsync();

        _logger.LogInformation(
            "Seed complete: {Users} users, {Groups} groups, {Hangouts} hangouts, {Friendships} friendships created",
            usersCreated, groupsCreated, hangoutsCreated, friendshipsCreated);

        return new SeedResult(usersCreated, groupsCreated, hangoutsCreated, friendshipsCreated);
    }

    private async Task<int> SeedUsersAsync()
    {
        var now = DateTime.UtcNow;

        // Only seed the 7 other users — Alexander (AlexId) already exists in the DB
        var users = new List<UserRecord>
        {
            new()
            {
                Id = LaceyId,
                Email = "lax14alex@gmail.com",
                FirstName = "Lacey",
                LastName = "Rubin",
                ProfileImageUrl = null,
                CreatedAt = now.AddDays(-28),
                UpdatedAt = now
            },
            new()
            {
                Id = JordanId,
                Email = "jordan@gmail.com",
                FirstName = "Jordan",
                LastName = "Moldowsky",
                ProfileImageUrl = null,
                CreatedAt = now.AddDays(-25),
                UpdatedAt = now
            },
            new()
            {
                Id = MattId,
                Email = "matt.korn@gmail.com",
                FirstName = "Matt",
                LastName = "Korn",
                ProfileImageUrl = null,
                CreatedAt = now.AddDays(-20),
                UpdatedAt = now
            },
            new()
            {
                Id = PietroId,
                Email = "pete.b@gmail.com",
                FirstName = "Pietro",
                LastName = "Buonfrisco",
                ProfileImageUrl = null,
                CreatedAt = now.AddDays(-18),
                UpdatedAt = now
            },
            new()
            {
                Id = KirstinId,
                Email = "kcox@gmail.com",
                FirstName = "Kirstin",
                LastName = "Cox",
                ProfileImageUrl = null,
                CreatedAt = now.AddDays(-15),
                UpdatedAt = now
            },
            new()
            {
                Id = LukeId,
                Email = "luke.rosenthal@gmail.com",
                FirstName = "Luke",
                LastName = "Rosenthal",
                ProfileImageUrl = null,
                CreatedAt = now.AddDays(-12),
                UpdatedAt = now
            },
            new()
            {
                Id = JakeId,
                Email = "jake.rosenthal@gmail.com",
                FirstName = "Jake",
                LastName = "Rosenthal",
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
                CreatedByUserId = AlexId,
                Members = new List<GroupMember>
                {
                    new() { UserId = AlexId, Role = GroupMemberRole.Admin, JoinedAt = now.AddDays(-20) },
                    new() { UserId = LaceyId, Role = GroupMemberRole.Member, JoinedAt = now.AddDays(-19) },
                    new() { UserId = JordanId, Role = GroupMemberRole.Member, JoinedAt = now.AddDays(-18) },
                    new() { UserId = MattId, Role = GroupMemberRole.Member, JoinedAt = now.AddDays(-17) }
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
                CreatedByUserId = LaceyId,
                Members = new List<GroupMember>
                {
                    new() { UserId = LaceyId, Role = GroupMemberRole.Admin, JoinedAt = now.AddDays(-15) },
                    new() { UserId = AlexId, Role = GroupMemberRole.Member, JoinedAt = now.AddDays(-14) },
                    new() { UserId = PietroId, Role = GroupMemberRole.Member, JoinedAt = now.AddDays(-13) },
                    new() { UserId = KirstinId, Role = GroupMemberRole.Member, JoinedAt = now.AddDays(-12) }
                },
                CreatedAt = now.AddDays(-15),
                UpdatedAt = now
            },
            new()
            {
                Id = GroupId3,
                Name = "Rosenthal Fam",
                Emoji = "🏠",
                Description = "Family hangouts",
                CreatedByUserId = AlexId,
                Members = new List<GroupMember>
                {
                    new() { UserId = AlexId, Role = GroupMemberRole.Admin, JoinedAt = now.AddDays(-10) },
                    new() { UserId = LukeId, Role = GroupMemberRole.Member, JoinedAt = now.AddDays(-9) },
                    new() { UserId = JakeId, Role = GroupMemberRole.Member, JoinedAt = now.AddDays(-8) }
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

    private async Task<int> SeedFriendshipsAsync()
    {
        var now = DateTime.UtcNow;

        // Create accepted friendships (dual documents per pair)
        var acceptedPairs = new[]
        {
            (AlexId, LaceyId, now.AddDays(-20)),
            (AlexId, JordanId, now.AddDays(-18)),
            (AlexId, MattId, now.AddDays(-15)),
            (AlexId, LukeId, now.AddDays(-10)),
            (AlexId, JakeId, now.AddDays(-8)),
            (LaceyId, PietroId, now.AddDays(-12)),
            (LaceyId, KirstinId, now.AddDays(-11)),
        };

        // Create a pending incoming request from Pietro to Alex
        var pendingPairs = new[]
        {
            (PietroId, AlexId, now.AddDays(-2)), // Pietro sent to Alex → Alex has incoming
        };

        int created = 0;

        foreach (var (userId, friendId, timestamp) in acceptedPairs)
        {
            var doc1 = new FriendshipRecord
            {
                Id = $"{userId}_{friendId}",
                UserId = userId,
                FriendId = friendId,
                Status = FriendshipStatus.Accepted,
                Direction = null,
                CreatedAt = timestamp,
                UpdatedAt = timestamp
            };
            var doc2 = new FriendshipRecord
            {
                Id = $"{friendId}_{userId}",
                UserId = friendId,
                FriendId = userId,
                Status = FriendshipStatus.Accepted,
                Direction = null,
                CreatedAt = timestamp,
                UpdatedAt = timestamp
            };

            await _cosmosContext.FriendshipsContainer.UpsertItemAsync(doc1, new PartitionKey(userId));
            created++;

            await _cosmosContext.FriendshipsContainer.UpsertItemAsync(doc2, new PartitionKey(friendId));
            created++;
        }

        foreach (var (senderId, receiverId, timestamp) in pendingPairs)
        {
            var outgoing = new FriendshipRecord
            {
                Id = $"{senderId}_{receiverId}",
                UserId = senderId,
                FriendId = receiverId,
                Status = FriendshipStatus.Pending,
                Direction = FriendshipDirection.Outgoing,
                CreatedAt = timestamp,
                UpdatedAt = timestamp
            };
            var incoming = new FriendshipRecord
            {
                Id = $"{receiverId}_{senderId}",
                UserId = receiverId,
                FriendId = senderId,
                Status = FriendshipStatus.Pending,
                Direction = FriendshipDirection.Incoming,
                CreatedAt = timestamp,
                UpdatedAt = timestamp
            };

            await _cosmosContext.FriendshipsContainer.UpsertItemAsync(outgoing, new PartitionKey(senderId));
            created++;

            await _cosmosContext.FriendshipsContainer.UpsertItemAsync(incoming, new PartitionKey(receiverId));
            created++;
        }

        _logger.LogInformation("Created {Count} friendship documents", created);
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
                CreatedByUserId = AlexId,
                GroupId = GroupId1,
                Attendees = new List<HangoutAttendee>
                {
                    new() { UserId = AlexId, RsvpStatus = RSVPStatus.Going, RespondedAt = now.AddDays(-1) },
                    new() { UserId = LaceyId, RsvpStatus = RSVPStatus.Going, RespondedAt = now.AddDays(-1) },
                    new() { UserId = JordanId, RsvpStatus = RSVPStatus.Maybe, RespondedAt = now.AddHours(-12) },
                    new() { UserId = MattId, RsvpStatus = RSVPStatus.Pending, RespondedAt = null }
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
                CreatedByUserId = LaceyId,
                GroupId = GroupId2,
                Attendees = new List<HangoutAttendee>
                {
                    new() { UserId = LaceyId, RsvpStatus = RSVPStatus.Going, RespondedAt = now.AddDays(-3) },
                    new() { UserId = AlexId, RsvpStatus = RSVPStatus.Going, RespondedAt = now.AddDays(-2) },
                    new() { UserId = PietroId, RsvpStatus = RSVPStatus.Going, RespondedAt = now.AddDays(-2) },
                    new() { UserId = KirstinId, RsvpStatus = RSVPStatus.NotGoing, RespondedAt = now.AddDays(-1) }
                },
                Status = HangoutStatus.Active,
                CreatedAt = now.AddDays(-3),
                UpdatedAt = now
            },
            // Upcoming hangout - this weekend
            new()
            {
                Id = HangoutId3,
                Title = "Family Dinner",
                Emoji = "🏠",
                Description = "Rosenthal family dinner at mom's place",
                Location = "Mom's House",
                StartTime = now.AddDays(3),
                EndTime = now.AddDays(3).AddHours(4),
                CreatedByUserId = AlexId,
                GroupId = GroupId3,
                Attendees = new List<HangoutAttendee>
                {
                    new() { UserId = AlexId, RsvpStatus = RSVPStatus.Going, RespondedAt = now.AddDays(-1) },
                    new() { UserId = LukeId, RsvpStatus = RSVPStatus.Going, RespondedAt = now.AddDays(-1) },
                    new() { UserId = JakeId, RsvpStatus = RSVPStatus.Maybe, RespondedAt = now.AddHours(-6) }
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
                CreatedByUserId = JordanId,
                GroupId = null,
                Attendees = new List<HangoutAttendee>
                {
                    new() { UserId = JordanId, RsvpStatus = RSVPStatus.Going, RespondedAt = now.AddDays(-1) },
                    new() { UserId = AlexId, RsvpStatus = RSVPStatus.Pending, RespondedAt = null },
                    new() { UserId = MattId, RsvpStatus = RSVPStatus.Going, RespondedAt = now.AddHours(-3) },
                    new() { UserId = PietroId, RsvpStatus = RSVPStatus.Maybe, RespondedAt = now.AddHours(-2) }
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