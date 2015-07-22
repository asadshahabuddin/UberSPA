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

    /**
     * Constructor.
     * @param latitude
     *            The latitude.
     * @param longitude
     *            The longitude.
     * @param polarAngle
     *            The polar angle.
     */
    public LatLng(double latitude,
                  double longitude,
                  double polarAngle)
    {
        this.latitude   = latitude;
        this.longitude  = longitude;
        this.polarAngle = polarAngle;
    }

    /**
     * Set the latitude.
     * @param latitude
     *            The latitude.
     */
    public void setLatitude(double latitude)
    {
        this.latitude = latitude;
    }

    /**
     * Get the latitude.
     * @return
     *            The latitude.
     */
    public double getLatitude()
    {
        return latitude;
    }

    /**
     * Set the longitude.
     * @param longitude
     *            The longitude.
     */
    public void setLongitude(double longitude)
    {
        this.longitude = longitude;
    }

    /**
     * Get the longitude.
     * @return
     *            The longitude.
     */
    public double getLongitude()
    {
        return longitude;
    }

    /**
     * Set the polar angle.
     * @param polarAngle
     *            The polar angle.
     */
    public void setPolarAngle(double polarAngle)
    {
        this.polarAngle = polarAngle;
    }

    /**
     * Get the polar angle.
     * @return
     *            The polar angle.
     */
    public double getPolarAngle()
    {
        return polarAngle;
    }
}
/* End of LatLng.java */