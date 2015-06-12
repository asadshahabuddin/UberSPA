package com.uberspa.latlng;

/**
 * Author : Asad Shahabuddin
 * Created: Jun 8, 2015
 */

class LatLng
{
    private double latitude;
    private double longitude;
    private double polarAngle;
    
    public LatLng(double latitude,
                  double longitude,
                  double polarAngle)
    {
        this.latitude   = latitude;
        this.longitude  = longitude;
        this.polarAngle = polarAngle;
    }
    
    public void setLatitude(double latitude)
    {
        this.latitude = latitude;
    }
    
    public double getLatitude()
    {
        return latitude;
    }
    
    public void setLongitude(double longitude)
    {
        this.longitude = longitude;
    }
    
    public double getLongitude()
    {
        return longitude;
    }
    
    public void setPolarAngle(double polarAngle)
    {
        this.polarAngle = polarAngle;
    }
    
    public double getPolarAngle()
    {
        return polarAngle;
    }
}
/* End of LatLng.java */