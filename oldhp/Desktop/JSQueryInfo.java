import java.applet.*;
import java.lang.*;
import java.net.*;
import java.util.*;

public class JSQueryInfo extends Applet
{
    public String getHost() throws UnknownHostException
    {
        return java.net.InetAddress.getLocalHost().getHostName();
    }
    
    public String getIp() throws UnknownHostException
    {
        java.lang.System.getProperty("os.name", "unbekannt");
        return java.net.InetAddress.getLocalHost().getHostAddress();
    }
    
    public String getSystemInfo(String prop)
    {
        return java.lang.System.getProperty(prop, "unbekannt");
    }
    
    public String getMemInfo()
    {
        long free=java.lang.Runtime.getRuntime().freeMemory();
        long avail=java.lang.Runtime.getRuntime().totalMemory();
        
        return Long.toString(free)+"/"+Long.toString(avail);
    }
    
    public String getCPUCount()
    {
        return Integer.toString(java.lang.Runtime.getRuntime().availableProcessors());
    }
}
