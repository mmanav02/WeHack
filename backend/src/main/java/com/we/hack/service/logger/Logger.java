package com.we.hack.service.logger;

import java.io.*;
import java.text.SimpleDateFormat;
import java.util.*;

public class Logger {
    private static Logger instance;
    private static Queue<String> log;
    private static int SIZE;

    private Logger(int size) throws IOException {
        log = new LinkedList<>();
        logLoad();
        SIZE = size;
    }

    public synchronized static Logger getInstance(int size) throws IOException {
        if(instance == null) {
            instance = new Logger(size);
        }
        return instance;
    }

    private void logLoad() throws IOException {
        try {
            SimpleDateFormat ft = new SimpleDateFormat("dd-MM-yyyy");
            System.out.println("Logger package path: " + Logger.class.getPackage().getName().replace('.', '/'));
            
            // Create logs directory in a more accessible location
            String logDir = "logs/";
            String fileName = logDir + "log_" + ft.format(new Date()) + ".log";
            
            File logDirectory = new File(logDir);
            // Ensure the logs directory exists
            if (!logDirectory.exists()) {
                boolean dirCreated = logDirectory.mkdirs();
                if (dirCreated) {
                    System.out.println("Logs directory created: " + logDirectory.getAbsolutePath());
                } else {
                    System.err.println("Failed to create logs directory: " + logDirectory.getAbsolutePath());
                }
            }
            
            File f = new File(fileName);
            
            if (!f.exists()) {
                // Ensure parent directories exist
                File parentDir = f.getParentFile();
                if (parentDir != null && !parentDir.exists()) {
                    parentDir.mkdirs();
                }
                
                if (f.createNewFile()) {
                    System.out.println("New log file created: " + f.getAbsolutePath());
                } else {
                    System.err.println("Error creating new log file: " + f.getAbsolutePath());
                }
            } else {
                // Load existing log entries
                try (BufferedReader reader = new BufferedReader(new FileReader(f))) {
                    for (String line; (line = reader.readLine()) != null;) {
                        log.add(line);
                    }
                    System.out.println("Loaded " + log.size() + " existing log entries from: " + f.getAbsolutePath());
                }
            }
        } catch (Exception e) {
            System.err.println("Error initializing logger: " + e.getMessage());
            e.printStackTrace();
            throw new IOException("Failed to initialize logger", e);
        }
    }

    private boolean isFull() {
        return log.size() == SIZE;
    }

    private void shiftLog(){
        if(isFull()) {
            log.remove();
        }
    }

    private void writeLog(){
        try {
            SimpleDateFormat ft = new SimpleDateFormat("dd-MM-yyyy");
            String logDir = "logs/";
            String fileName = logDir + "log_" + ft.format(new Date()) + ".log";
            
            // Ensure directory exists before writing
            File logDirectory = new File(logDir);
            if (!logDirectory.exists()) {
                logDirectory.mkdirs();
            }
            
            try (BufferedWriter writer = new BufferedWriter(new FileWriter(fileName, false))) {
                Queue<String> tempLog = new LinkedList<>(log);
                while (!tempLog.isEmpty()) {
                    writer.write(tempLog.poll());
                    writer.newLine();
                }
                writer.flush();
            }
        } catch (IOException e) {
            System.err.println("An error occurred while writing to the log file: " + e.getMessage());
            // Don't throw exception to prevent application failure
        }
    }

    public void INFO(String msg){
        try {
            shiftLog();
            String temp = "[INFO] " + new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date()) + " " + msg;
            log.add(temp);
            writeLog();
        } catch (Exception e) {
            System.err.println("Error logging INFO message: " + e.getMessage());
        }
    }

    public void WARN(String msg){
        try {
            shiftLog();
            String temp = "[WARN] " + new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date()) + " " + msg;
            log.add(temp);
            writeLog();
        } catch (Exception e) {
            System.err.println("Error logging WARN message: " + e.getMessage());
        }
    }

    public void ERROR(String msg){
        try {
            shiftLog();
            String temp = "[ERROR] " + new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date()) + " " + msg;
            log.add(temp);
            writeLog();
        } catch (Exception e) {
            System.err.println("Error logging ERROR message: " + e.getMessage());
        }
    }

    public void SEVERE(String msg){
        try {
            shiftLog();
            String temp = "[SEVERE] " + new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date()) + " " + msg;
            log.add(temp);
            writeLog();
        } catch (Exception e) {
            System.err.println("Error logging SEVERE message: " + e.getMessage());
        }
    }

    public void DEBUG(String msg){
        try {
            shiftLog();
            String temp = "[DEBUG] " + new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date()) + " " + msg;
            log.add(temp);
            System.out.println(temp);
            writeLog();
        } catch (Exception e) {
            System.err.println("Error logging DEBUG message: " + e.getMessage());
        }
    }
}
