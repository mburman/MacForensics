using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Newtonsoft.Json;

namespace EnumerateFiles
{
    class ColumnInfo
    {
        public ColumnInfo(string name, string id, bool isDate = false)
        {
            this.name = name;
            this.id = id;
            this.isDate = isDate;
        }

        public string name;
        public string id;
        public bool isDate;
    }

    class JsonFileInfo
    {
        public JsonFileInfo(FileSystemInfo fileSystemInfo)
        {
            name = fileSystemInfo.Name;
            path = fileSystemInfo.FullName;
            lastAccessTime = fileSystemInfo.LastAccessTimeUtc;
            lastWriteTime = fileSystemInfo.LastWriteTimeUtc;
            type = fileSystemInfo.Attributes.HasFlag(FileAttributes.Directory) ? "Directory" : "File";
            isHidden = fileSystemInfo.Attributes.HasFlag(FileAttributes.Hidden);
            isEncrypted = fileSystemInfo.Attributes.HasFlag(FileAttributes.Encrypted);
            isSystem = fileSystemInfo.Attributes.HasFlag(FileAttributes.System);
        }

        public string name;
        public string path;
        public DateTime lastAccessTime;
        public DateTime lastWriteTime;
        public string type;
        public bool isHidden;
        public bool isEncrypted;
        public bool isSystem;
    }

    class GridContainer
    {
        public ColumnInfo[] columns = { 
                                          new ColumnInfo("Name", "name"), new ColumnInfo("Path", "path"), new ColumnInfo("Last Access Time", "lastAccessTime", true),
                                          new ColumnInfo("Last Write Time", "lastWriteTime", true), new ColumnInfo("Type", "type"), new ColumnInfo("Hidden", "isHidden"),
                                          new ColumnInfo("Encrypted", "isEncrypted"), new ColumnInfo("System File", "isSystem") 
                                      };
        public JsonFileInfo[] events;
    }

    class Program
    {
        static void Main(string[] args)
        {
            if (args.Length != 2)
            {
                Console.WriteLine("Usage: " + System.AppDomain.CurrentDomain.FriendlyName + " <directory root> <output file path>");
                return;
            }

            GridContainer gridJson = new GridContainer();
            gridJson.events = TraverseTree(args[0]).ToArray();

            string json = JsonConvert.SerializeObject(gridJson, Formatting.Indented);

            File.WriteAllText(args[1], json);
        }

        //adapted from http://msdn.microsoft.com/en-us/library/bb513869.aspx
        public static IEnumerable<JsonFileInfo> TraverseTree(string root)
        {
            // Data structure to hold names of subfolders to be 
            // examined for files.
            Stack<string> dirs = new Stack<string>();

            if (!System.IO.Directory.Exists(root))
            {
                throw new ArgumentException();
            }
            dirs.Push(root);

            while (dirs.Count > 0)
            {
                string currentDir = dirs.Pop();
                string[] subDirs;
                JsonFileInfo jsonDirectoryInfo;

                try
                {
                    jsonDirectoryInfo = new JsonFileInfo(new DirectoryInfo(currentDir));
                    subDirs = System.IO.Directory.GetDirectories(currentDir);
                }
                // An UnauthorizedAccessException exception will be thrown if we do not have 
                // discovery permission on a folder or file. It may or may not be acceptable  
                // to ignore the exception and continue enumerating the remaining files and  
                // folders. It is also possible (but unlikely) that a DirectoryNotFound exception  
                // will be raised. This will happen if currentDir has been deleted by 
                // another application or thread after our call to Directory.Exists. The  
                // choice of which exceptions to catch depends entirely on the specific task  
                // you are intending to perform and also on how much you know with certainty  
                // about the systems on which this code will run. 
                catch (UnauthorizedAccessException e)
                {
                    Console.WriteLine(e.Message);
                    continue;
                }
                catch (System.IO.DirectoryNotFoundException e)
                {
                    Console.WriteLine(e.Message);
                    continue;
                }

                yield return jsonDirectoryInfo;

                string[] files = null;
                try
                {
                    files = System.IO.Directory.GetFiles(currentDir);
                }

                catch (UnauthorizedAccessException e)
                {

                    Console.WriteLine(e.Message);
                    continue;
                }

                catch (System.IO.DirectoryNotFoundException e)
                {
                    Console.WriteLine(e.Message);
                    continue;
                }
                // Perform the required action on each file here. 
                // Modify this block to perform your required task. 
                foreach (string file in files)
                {
                    JsonFileInfo jsonFileInfo;
                    try
                    {
                        // Perform whatever action is required in your scenario.
                        System.IO.FileInfo fi = new System.IO.FileInfo(file);
                        jsonFileInfo = new JsonFileInfo(fi);
                    }
                    catch (System.IO.FileNotFoundException e)
                    {
                        // If file was deleted by a separate application 
                        //  or thread since the call to TraverseTree() 
                        // then just continue.
                        Console.WriteLine(e.Message);
                        continue;
                    }

                    yield return jsonFileInfo;
                }

                // Push the subdirectories onto the stack for traversal. 
                // This could also be done before handing the files. 
                foreach (string str in subDirs)
                {
                    dirs.Push(str);
                }
            }
        }
    }
}
