using UnityEngine;
using System;
using System.Collections.Generic;
using System.Threading;
using WebSocketSharp;
using WebSocketSharp.Server;
using Newtonsoft.Json;

public class WebSocketServer : MonoBehaviour
{
    [SerializeField] private int port = 8080;
    private WebSocketServer wssv;
    
    public static event Action<string> OnMessageReceived;
    
    void Start()
    {
        StartServer();
    }
    
    void StartServer()
    {
        try
        {
            wssv = new WebSocketServer(port);
            wssv.AddWebSocketService<CodeSocket>("/code");
            wssv.Start();
            
            Debug.Log($"WebSocket server started on port {port}");
        }
        catch (Exception e)
        {
            Debug.LogError($"Failed to start WebSocket server: {e.Message}");
        }
    }
    
    void OnDestroy()
    {
        if (wssv != null)
        {
            wssv.Stop();
            Debug.Log("WebSocket server stopped");
        }
    }
    
    public class CodeSocket : WebSocketBehavior
    {
        protected override void OnMessage(MessageEventArgs e)
        {
            Debug.Log($"Message received: {e.Data}");
            
            // Forward the message to the Unity main thread
            MainThreadDispatcher.Enqueue(() => {
                OnMessageReceived?.Invoke(e.Data);
            });
        }
    }
}

public class MainThreadDispatcher : MonoBehaviour
{
    private static readonly Queue<Action> executionQueue = new Queue<Action>();
    private static MainThreadDispatcher instance = null;
    
    public static void Enqueue(Action action)
    {
        lock (executionQueue)
        {
            executionQueue.Enqueue(action);
        }
    }
    
    void Awake()
    {
        if (instance == null)
        {
            instance = this;
            DontDestroyOnLoad(gameObject);
        }
        else
        {
            Destroy(gameObject);
        }
    }
    
    void Update()
    {
        while (true)
        {
            Action action = null;
            lock (executionQueue)
            {
                if (executionQueue.Count > 0)
                {
                    action = executionQueue.Dequeue();
                }
                else
                {
                    break;
                }
            }
            action?.Invoke();
        }
    }
}