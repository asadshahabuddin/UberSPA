package com.uberspa.latlng;

/* Import list */
import java.util.HashSet;
import java.util.HashMap;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.io.BufferedReader;
import java.text.DecimalFormat;

/**
 * Author : Asad Shahabuddin
 * Created: Jun 7, 2015
 */

public class ProcessCoords
{
    /* Maps to store polygon extremities for each surge group */
    private HashMap<String, LatLng> minLatMap;
    private HashMap<String, LatLng> minLngMap;
    private HashMap<String, LatLng> maxLatMap;
    private HashMap<String, LatLng> maxLngMap;
    
    private BufferedReader br;
    
    /**
     * Constructor
     */
    public ProcessCoords()
    {
        minLatMap = new HashMap<String, LatLng>();
        minLngMap = new HashMap<String, LatLng>();
        maxLatMap = new HashMap<String, LatLng>();
        maxLngMap = new HashMap<String, LatLng>();
    }
    
    /**
     * Parse and return all surge price groups in the file.
     * @param file
     *            The file containing surge price group data.
     * @return
     *            A list of all surge price groups.
     */
    public HashSet<String> parseGroups(String file)
        throws IOException
    {
        HashSet<String> groups = new HashSet<String>();
        br = new BufferedReader(new FileReader(file));
        String line = "";
        while((line = br.readLine()) != null)
        {
            groups.add(line.split("\\s+")[2]);
        }
        br.close();
        return groups;
    }
    
    /**
     * Calculate the minimum and maximum latitudes and longitudes
     * for each surge price group.
     * @param file
     *            File containing surge price group coordinates.
     * @throws IOException
     */
    public void calcPolygonExtremities(String file)
        throws IOException
    {
        br = new BufferedReader(new FileReader(file));
        String line = "";
        
        while((line = br.readLine()) != null)
        {
            String[] position = line.split("\\s+");
            Double lat = Double.valueOf(position[0]);
            Double lng = Double.valueOf(position[1]);
            
            if(!minLatMap.containsKey(position[2]))
            {
                minLatMap.put(position[2], new LatLng(Double.MAX_VALUE, 0D, 0D));
                minLngMap.put(position[2], new LatLng(0D, Double.MAX_VALUE, 0D));
                maxLatMap.put(position[2], new LatLng(-Double.MAX_VALUE, 0D, 0D));
                maxLngMap.put(position[2], new LatLng(0D, -Double.MAX_VALUE, 0D));
            }
            
            if(Double.compare(lat, minLatMap.get(position[2]).getLatitude()) < 0)
            {
                minLatMap.put(position[2], new LatLng(lat, lng, 0D));
            }
            if(Double.compare(lng, minLngMap.get(position[2]).getLongitude()) < 0)
            {
                minLngMap.put(position[2], new LatLng(lat, lng, 0D));
            }
            if(Double.compare(lat, maxLatMap.get(position[2]).getLatitude()) > 0)
            {
                maxLatMap.put(position[2], new LatLng(lat, lng, 0D));
            }
            if(Double.compare(lng, maxLngMap.get(position[2]).getLongitude()) > 0)
            {
                maxLngMap.put(position[2], new LatLng(lat, lng, 0D));
            }
        }
        br.close();
    }
    
    /**
     * Output the maps containing group extremities data to console.
     */
    public void outputMaps()
    {
        System.out.println(">Minimum latitudes");
        for(String key : minLatMap.keySet())
        {
            System.out.println("Group " + key +
                               ": ("    + minLatMap.get(key).getLatitude() +
                               ","      + minLatMap.get(key).getLongitude() +
                               ")");
        }
        System.out.println();
        
        System.out.println(">Minimum longitudes");
        for(String key : minLngMap.keySet())
        {
            System.out.println("Group " + key +
                               ": ("    + minLngMap.get(key).getLatitude() +
                               ","      + minLngMap.get(key).getLongitude() +
                               ")");
        }
        System.out.println();
        
        System.out.println(">Maximum latitudes");
        for(String key : maxLatMap.keySet())
        {
            System.out.println("Group " + key +
                               ": ("    + maxLatMap.get(key).getLatitude() +
                               ","      + maxLatMap.get(key).getLongitude() +
                               ")");
        }
        System.out.println();
        
        System.out.println(">Maximum longitudes");
        for(String key : maxLngMap.keySet())
        {
            System.out.println("Group " + key +
                               ": ("    + maxLngMap.get(key).getLatitude() +
                               ","      + maxLngMap.get(key).getLongitude() +
                               ")");
        }
        System.out.println();
    }
    
    /**
     * Sort a list of 2D coordinates in clockwise order. 
     * @param file
     *            The file containing a list of a 2D coordinates.
     * @param group
     *            The group number to work on.
     * @throws IOException
     */
    public void sortClockwise(String file, String group)
        throws IOException
    {
        ArrayList<LatLng> coords = new ArrayList<LatLng>();
        br = new BufferedReader(new FileReader(file));
        String line = "";
        
        while((line = br.readLine()) != null)
        {
            String[] position = line.split("\\s+");
            if(position[2].equals(group))
            {
                coords.add(new LatLng(Double.valueOf(position[0]),
                                      Double.valueOf(position[1]),
                                      0D));
            }
        }
        br.close();

        /* Calculate the centroid of the polygon composed of all points */
        LatLng ref = centroid(coords);
        /* Calculate the polar angles of each location wrt the reference */
        for(LatLng coord : coords)
        {
            coord.setPolarAngle(calcPolarAngle(ref, coord));
        }
        /* Sort the location objects */
        Collections.sort(coords, new LatLngComparator());
        writeCoordsToFS(coords, group);
    }
    
    /**
     * Calculate the centroid of the polygon represented by the specified  
     * set of coordinates.
     * @param coords
     *            A list of coordinates.
     * @return
     *            Centroid of the polygon.
     */
    public LatLng centroid(ArrayList<LatLng> coords)
    {
        double sumX = 0D;
        double sumY = 0D;
        int count   = 0;
        DecimalFormat df = new DecimalFormat(".######");
        
        for(LatLng coord : coords)
        {
            sumX += coord.getLatitude();
            sumY += coord.getLongitude();
            count++;
        }
        
        return new LatLng(
            Double.valueOf(df.format(sumX / count)),
            Double.valueOf(df.format(sumY / count)),
            0D
        );
    }
    
    /**
     * Calculate polar angle wrt to the reference location.
     * @param ref
     *            The reference location.
     * @param p
     *            The point in space for which the polar angle is to be
     *            calculated.
     * @return
     *            The polar angle of the point wrt the reference location.
     */
    public double calcPolarAngle(LatLng ref, LatLng p)
    {
        return Math.atan2(p.getLongitude() - ref.getLongitude(),
                          p.getLatitude()  - ref.getLatitude());
    }
    
    /**
     * Output the list of coordinates to console.
     * @param coords
     *            The list of coordinates.
     */
    public void writeCoordsToFS(ArrayList<LatLng> coords, String group)
        throws IOException
    {
        FileWriter fw = new FileWriter(Properties.FILE_NYC_OUT, true);
        fw.write(">Group " + group + "\n");
        
        for(LatLng coord : coords)
        {
            fw.write("("  + coord.getLatitude() +
                     ", " + coord.getLongitude() +
                     ") with polar angle " + coord.getPolarAngle() +
                     " radians\n");
        }
        
        fw.write("\n");
        fw.close();
    }
    
    /**
     * Main method for unit testing
     * @param args
     *            Program arguments.
     */
    public static void main(String[] args)
    {
        System.out.println();
        System.out.println("======================");
        System.out.println("SORTING BY POLAR ANGLE");
        System.out.println("======================");
        try
        {
            ProcessCoords pc = new ProcessCoords();
            for(String group : pc.parseGroups(Properties.FILE_NYC_IN))
            {
                pc.sortClockwise(Properties.FILE_NYC_IN, group);
            }
        }
        catch(IOException ioe)
        {
            ioe.printStackTrace();
        }
        finally
        {
            System.out.println("Completed.");
        }
    }
}
/* End of ProcessCoords.java */