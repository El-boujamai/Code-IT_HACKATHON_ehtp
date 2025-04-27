To install the required packages in Unity using the **Package Manager**, follow these steps. I'll guide you through adding both built-in and custom packages like `NativeWebSocket`.

---

### **1. Open the Unity Package Manager**
1. Open your Unity project.
2. In the Unity Editor, go to **Window > Package Manager**.
   - This will open the **Package Manager** window.

---

### **2. Install Built-In Packages (XR Interaction Toolkit, XR Plugin Management, OpenXR Plugin)**
These packages are part of Unity's official package repository. You can install them directly via the Package Manager.

#### **Steps:**
1. In the **Package Manager** window:
   - From the dropdown menu at the top-left, select **Unity Registry** (this lists all available Unity packages).
   
2. Search for each package and install it:
   - **XR Interaction Toolkit**:
     - Search for "XR Interaction Toolkit" in the search bar.
     - Click on the package and then click the **Install** button.
   - **XR Plugin Management**:
     - Search for "XR Plugin Management."
     - Click on the package and then click the **Install** button.
   - **OpenXR Plugin**:
     - Search for "OpenXR Plugin."
     - Click on the package and then click the **Install** button.

3. Wait for the installation to complete for each package.

---

### **3. Install Newtonsoft JSON**
`Newtonsoft.Json` (also known as Json.NET) is a popular library for parsing JSON data. Unity provides this package in its registry.

#### **Steps:**
1. In the **Package Manager** window:
   - Ensure the dropdown menu is set to **Unity Registry**.
2. Search for "Newtonsoft Json" or "com.unity.nuget.newtonsoft-json."
3. Click on the package and then click the **Install** button.

---

### **4. Install NativeWebSocket (from Git URL)**
Since `NativeWebSocket` is not available in Unity's official registry, you need to add it manually using its Git URL.

#### **Steps:**
1. Open the **Package Manager** window.
2. Click the **+ (Add)** button in the top-left corner of the window and select **Add package from git URL...**.
3. Enter the following Git URL:
   ```
   https://github.com/endel/NativeWebSocket.git
   ```
4. Press **Enter** or click **Add**.
   - Unity will fetch and install the package from the Git repository.

---

### **5. Verify Installed Packages**
After installing all the packages:
1. Go to **Window > Package Manager**.
2. Check the list of installed packages to ensure that all the required packages (`XR Interaction Toolkit`, `XR Plugin Management`, `OpenXR Plugin`, `Newtonsoft Json`, and `NativeWebSocket`) are listed.

---

### **6. Configure XR Plugins (Optional)**
If you’re working with XR (e.g., VR/AR), you may need to configure the XR plugins:
1. Go to **Edit > Project Settings > XR Plug-in Management**.
2. Enable the desired platform (e.g., OpenXR) under the **Plug-in Providers** section.
3. Follow any additional setup instructions specific to your XR hardware.

---

### **7. Test the Setup**
1. Create a simple script to test `Newtonsoft.Json` and `NativeWebSocket`:
   ```csharp
   using UnityEngine;
   using Newtonsoft.Json;
   using NativeWebSocket;

   public class TestPackages : MonoBehaviour
   {
       async void Start()
       {
           // Example: Using Newtonsoft.Json
           var person = new { Name = "John", Age = 30 };
           string json = JsonConvert.SerializeObject(person);
           Debug.Log("Serialized JSON: " + json);

           // Example: Using NativeWebSocket
           var socket = new WebSocket("ws://echo.websocket.events");
           await socket.Connect();
           Debug.Log("WebSocket Connected!");
       }
   }
   ```

2. Attach the script to a GameObject in your scene and run the game to verify that everything works.

---

### **Troubleshooting**
- **Missing Packages**: If a package doesn’t appear in the Package Manager, ensure you’re connected to the internet and that Unity’s registry is accessible.
- **Git URL Issues**: If `NativeWebSocket` fails to install, ensure the Git URL is correct and that your system has Git installed.
- **Version Conflicts**: Some packages may have version conflicts. Check the package documentation for compatibility details.

---

By following these steps, you’ll have successfully installed and configured all the required packages in your Unity project. Let me know if you encounter any issues or need further clarification!