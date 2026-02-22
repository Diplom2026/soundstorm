FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY . .
RUN dotnet restore MusicStreamingApi.csproj
RUN dotnet publish MusicStreamingApi.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 3000
ENTRYPOINT ["dotnet", "MusicStreamingApi.dll"]
