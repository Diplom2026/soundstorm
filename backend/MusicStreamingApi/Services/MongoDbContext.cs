using MongoDB.Driver;

namespace MusicStreamingApi.Services;

public class MongoDbContext
{
    private readonly IMongoDatabase _db;

    public MongoDbContext(IConfiguration config)
    {
        var client = new MongoClient(config["MongoDb:ConnectionString"]);
        _db = client.GetDatabase(config["MongoDb:DatabaseName"]);
    }

    public IMongoCollection<Models.User> Users => _db.GetCollection<Models.User>("users");
}
