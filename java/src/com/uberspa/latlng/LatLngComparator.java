package com.uberspa.latlng;

/* Import list */
import java.util.Comparator;

/**
 * Author : Asad Shahabuddin
 * Created: Jun 9, 2015
 */

public class LatLngComparator implements Comparator<LatLng>
{
    @Override
    public int compare(LatLng latLng1, LatLng latLng2)
    {
        return Double.compare(latLng1.getPolarAngle(),
                              latLng2.getPolarAngle());
    }
}
/* End of LatLngComparator.java */