using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Azure.Cosmos;
using Microsoft.IdentityModel.Tokens;
using SocialCoordinationApp.Configuration;
using SocialCoordinationApp.Infrastructure;
using SocialCoordinationApp.Services;

namespace SocialCoordinationApp.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        // Cosmos DB configuration
        services.Configure<CosmosConfiguration>(configuration.GetSection(CosmosConfiguration.SectionName));

        var cosmosConfig = configuration.GetSection(CosmosConfiguration.SectionName).Get<CosmosConfiguration>()!;
        var cosmosClientOptions = new CosmosClientOptions
        {
            SerializerOptions = new CosmosSerializationOptions
            {
                PropertyNamingPolicy = CosmosPropertyNamingPolicy.CamelCase
            }
        };
        var cosmosClient = new CosmosClient(cosmosConfig.Endpoint, cosmosConfig.Key, cosmosClientOptions);
        services.AddSingleton(cosmosClient);
        services.AddSingleton<ICosmosContext, CosmosContext>();

        // Clerk configuration
        services.Configure<ClerkConfiguration>(configuration.GetSection(ClerkConfiguration.SectionName));

        var clerkConfig = configuration.GetSection(ClerkConfiguration.SectionName).Get<ClerkConfiguration>()!;
        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.Authority = clerkConfig.Authority;
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = clerkConfig.Authority,
                    ValidateAudience = false,
                    ValidateLifetime = true,
                    NameClaimType = "sub"
                };
            });
        services.AddAuthorization();

        return services;
    }

    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddScoped<IUsersService, UsersService>();
        services.AddScoped<IGroupsService, GroupsService>();
        services.AddScoped<IHangoutsService, HangoutsService>();
        services.AddScoped<IFriendsService, FriendsService>();
        services.AddScoped<INotificationsService, NotificationsService>();

        return services;
    }
}