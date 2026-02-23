using Microsoft.Azure.Cosmos;

namespace SocialCoordinationApp.Infrastructure;

public static class CosmosExtensions
{
    public static async Task<T?> ReadItemOrDefaultAsync<T>(
        this Container container,
        string id,
        PartitionKey partitionKey)
    {
        try
        {
            var response = await container.ReadItemAsync<T>(id, partitionKey);
            return response.Resource;
        }
        catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            return default;
        }
    }

    public static async Task<List<T>> QueryItemsAsync<T>(
        this Container container,
        QueryDefinition queryDefinition,
        string? partitionKey = null)
    {
        var queryOptions = new QueryRequestOptions();
        if (partitionKey != null)
        {
            queryOptions.PartitionKey = new PartitionKey(partitionKey);
        }

        var iterator = container.GetItemQueryIterator<T>(queryDefinition, requestOptions: queryOptions);
        var results = new List<T>();

        while (iterator.HasMoreResults)
        {
            var response = await iterator.ReadNextAsync();
            results.AddRange(response);
        }

        return results;
    }

    public static async Task<List<T>> QueryItemsCrossPartitionAsync<T>(
        this Container container,
        QueryDefinition queryDefinition)
    {
        var iterator = container.GetItemQueryIterator<T>(queryDefinition);
        var results = new List<T>();

        while (iterator.HasMoreResults)
        {
            var response = await iterator.ReadNextAsync();
            results.AddRange(response);
        }

        return results;
    }
}