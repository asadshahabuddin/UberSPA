/*
    Author : Asad Shahabuddin
    File   : service.js
    Details: REST Service for the Uber Surge Pricing application.
    Email  : shahabuddin.a@husky.neu.edu
*/

app.factory("GlobalService", function GlobalService($http)
{
    /* Get the list of groups for the city. */
    var groups = function(city, callback)
    {
        $http.get("/api/" + city + "/groups")
        .success(callback);
    };

    /* Get the set of co-ordinate pairs for the group id in the city. */
    var coords = function(city, gid, callback)
    {
        $http.get("/api/" + city + "/group/" + gid + "/coords")
        .success(callback);
    };

    return {
        groups: groups,
        coords: coords
    };
});
/* End of service.js */