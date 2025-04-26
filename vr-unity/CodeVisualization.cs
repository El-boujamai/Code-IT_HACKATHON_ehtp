using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using Newtonsoft.Json;
using NativeWebSocket;

public class CodeVisualization : MonoBehaviour
{
    [SerializeField] private GameObject variablePrefab;
    [SerializeField] private GameObject arrayPrefab;
    [SerializeField] private GameObject loopPrefab;
    [SerializeField] private GameObject functionPrefab;
    [SerializeField] private Transform visualizationRoot;
    
    private WebSocket webSocket;
    private string dataFilePath;
    private Dictionary<string, GameObject> visualElements = new Dictionary<string, GameObject>();
    
    private void Start()
    {
        // Path to look for data file (this would be coordinated with the backend)
        dataFilePath = Path.Combine(Application.persistentDataPath, "current-visualization.json");
        
        // Set up periodic checking for file changes if using file-based approach
        InvokeRepeating("CheckForVisualizationData", 2.0f, 1.0f);
        
        // Set up WebSocket connection
        ConnectToWebSocket();
    }
    
    async void ConnectToWebSocket()
    {
        webSocket = new WebSocket("ws://localhost:5000");

        webSocket.OnOpen += () => {
            Debug.Log("Connection open!");
        };

        webSocket.OnError += (e) => {
            Debug.LogError("WebSocket error: " + e);
        };

        webSocket.OnClose += (e) => {
            Debug.Log("Connection closed!");
        };

        webSocket.OnMessage += (bytes) => {
            var message = System.Text.Encoding.UTF8.GetString(bytes);
            ProcessWebSocketMessage(message);
        };

        // Keep sending messages to keep the connection alive
        InvokeRepeating("SendWebSocketPing", 0.0f, 5.0f);
        
        await webSocket.Connect();
    }
    
    void SendWebSocketPing()
    {
        if (webSocket.State == WebSocketState.Open)
        {
            webSocket.Send(System.Text.Encoding.UTF8.GetBytes("ping"));
        }
    }
    
    void ProcessWebSocketMessage(string message)
    {
        try
        {
            var data = JsonUtility.FromJson<VisualizationData>(message);
            CreateVisualization(data);
        }
        catch (Exception e)
        {
            Debug.LogError("Error processing WebSocket message: " + e.Message);
        }
    }
    
    void CheckForVisualizationData()
    {
        if (File.Exists(dataFilePath))
        {
            try
            {
                string json = File.ReadAllText(dataFilePath);
                var data = JsonUtility.FromJson<VisualizationData>(json);
                
                // Create visualization based on data
                CreateVisualization(data);
                
                // Optional: Remove file after processing
                File.Delete(dataFilePath);
            }
            catch (Exception e)
            {
                Debug.LogError("Error reading visualization data: " + e.Message);
            }
        }
    }
    
    void CreateVisualization(VisualizationData data)
    {
        // Clear previous visualization
        ClearVisualization();
        
        // Create new visualization elements
        if (data.variables != null)
        {
            CreateVariables(data.variables);
        }
        
        if (data.arrays != null)
        {
            CreateArrays(data.arrays);
        }
        
        if (data.loops != null)
        {
            CreateLoops(data.loops);
        }
        
        if (data.functions != null)
        {
            CreateFunctions(data.functions);
        }
    }
    
    void ClearVisualization()
    {
        foreach (var element in visualElements.Values)
        {
            Destroy(element);
        }
        
        visualElements.Clear();
    }
    
    void CreateVariables(List<VariableData> variables)
    {
        for (int i = 0; i < variables.Count; i++)
        {
            var variable = variables[i];
            Vector3 position = new Vector3(-5 + (i * 2), 2, 0);
            
            GameObject variableObj = Instantiate(variablePrefab, position, Quaternion.identity, visualizationRoot);
            variableObj.name = "Variable_" + variable.name;
            
            // Set up variable visualization
            var visualizer = variableObj.GetComponent<VariableVisualizer>();
            if (visualizer != null)
            {
                visualizer.SetVariable(variable.name, variable.value?.ToString(), variable.type);
            }
            
            visualElements[variable.name] = variableObj;
        }
    }
    
    void CreateArrays(List<ArrayData> arrays)
    {
        for (int i = 0; i < arrays.Count; i++)
        {
            var array = arrays[i];
            Vector3 position = new Vector3(-5 + (i * 3), 0, 0);
            
            GameObject arrayObj = Instantiate(arrayPrefab, position, Quaternion.identity, visualizationRoot);
            arrayObj.name = "Array_" + array.name;
            
            // Set up array visualization
            var visualizer = arrayObj.GetComponent<ArrayVisualizer>();
            if (visualizer != null)
            {
                visualizer.SetArray(array.name, array.elements);
            }
            
            visualElements[array.name] = arrayObj;
        }
    }
    
    void CreateLoops(List<LoopData> loops)
    {
        for (int i = 0; i < loops.Count; i++)
        {
            var loop = loops[i];
            Vector3 position = new Vector3(0, -3 + (i * -2), 0);
            
            GameObject loopObj = Instantiate(loopPrefab, position, Quaternion.identity, visualizationRoot);
            loopObj.name = "Loop_" + i;
            
            // Set up loop visualization
            var visualizer = loopObj.GetComponent<LoopVisualizer>();
            if (visualizer != null)
            {
                visualizer.SetLoop(loop.type, loop.variable);
            }
            
            visualElements["loop_" + i] = loopObj;
        }
    }
    
    void CreateFunctions(List<FunctionData> functions)
    {
        for (int i = 0; i < functions.Count; i++)
        {
            var function = functions[i];
            Vector3 position = new Vector3(5, 0 + (i * -2), 0);
            
            GameObject functionObj = Instantiate(functionPrefab, position, Quaternion.identity, visualizationRoot);
            functionObj.name = "Function_" + function.name;
            
            // Set up function visualization
            var visualizer = functionObj.GetComponent<FunctionVisualizer>();
            if (visualizer != null)
            {
                visualizer.SetFunction(function.name, function.params);
            }
            
            visualElements[function.name] = functionObj;
        }
    }
    
    async void OnDestroy()
    {
        if (webSocket != null)
        {
            await webSocket.Close();
        }
    }
}

// Data structures matching JSON format from backend
[Serializable]
public class VisualizationData
{
    public List<VariableData> variables;
    public List<ArrayData> arrays;
    public List<LoopData> loops;
    public List<FunctionData> functions;
    public List<ConditionalData> conditionals;
}

[Serializable]
public class VariableData
{
    public string name;
    public string value;
    public string type;
}

[Serializable]
public class ArrayData
{
    public string name;
    public List<string> elements;
    public int length;
}

[Serializable]
public class LoopData
{
    public string type;
    public string variable;
    public string body;
}

[Serializable]
public class FunctionData
{
    public string name;
    public List<string> params;
}

[Serializable]
public class ConditionalData
{
    public string type;
    public bool hasElse;
}