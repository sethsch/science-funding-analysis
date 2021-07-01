library(dplyr)
library(ggplot2)
library(tidyr)
library(readxl)
library(stringr)

setwd("~/Desktop/webofscience")

df <- read_xlsx('wos_funders_2010to2021.xlsx')


df$oa_summary <- as.factor(df$oa_summary)
df$funder_dataset <- as.factor(df$funder_dataset)
df$oa_binary <- ifelse(df$oa_summary == "NO_OA","NOT_OA","OA")

summary(df$`Publication Year`)

funders <- unique(df$funder_dataset)


df$`Publication Year` <- replace_na(df$`Publication Year`,9999)
## these all happen to be early access, so lets just chalk them up to 2021
unpub <- df %>% filter(`Publication Year` == 9999)

df <- df %>% mutate(`Publication Year` = replace(`Publication Year`,`Publication Year` == 9999,2021))
#df <- df %>% mutate(`Since 2013 Usage Count` = replace(`Since 2013 Usage Count`,`Since 2013 Usage Count` == 0,0.0001))
#df <- df %>% mutate(`Times Cited, All Databases` = replace(`Times Cited, All Databases`,`Times Cited, All Databases` == 0,0.0001))
df$oa_summary <- factor(df$oa_summary, levels= c("NO_OA",
                                                "AUTHOR_HOSTED",
                                               "PUBLISHER_HOSTED",
                                           "BOTH"))

plots <- c()

summary(df$`Publication Year`)

dsample <- head(df)
### plot OA stats by year and tile by funder
## produce the summary by funder and oa type and year

oa_funders <- df %>% group_by(funder_dataset,`Publication Year`,oa_summary) %>%
  summarize(num_pubs = n())

oa_funders$oa_summary <- factor(oa_funders$oa_summary, levels= c("NO_OA",
                                                                 "AUTHOR_HOSTED",
                                                                 "PUBLISHER_HOSTED",
                                                                "BOTH"))

colors <- c("NO_OA" = "#e67f83", "AUTHOR_HOSTED" = "#aecdc2", 
            "PUBLISHER_HOSTED" = "#6aaa96", "BOTH" = "#00876c")



# Stacked + percent
ggplot(oa_funders, aes(fill=oa_summary, x=`Publication Year`,y=`num_pubs`)) + 
  geom_area(position=position_fill(),alpha=0.7) +
  theme_classic()+
  facet_wrap(~funder_dataset)

df$`Times Cited, All Databases`
df$Usage

# citations and usage by funder and oa_type
scatPlot_use_cite <- ggplot(df,aes(x=`Since 2013 Usage Count`,y=`Times Cited, All Databases`,color=oa_summary)) +
  geom_point(alpha=0.6)+ scale_color_manual(values=colors) +
  ggtitle("Usage and Citation by Funder and OA Designations")+
  facet_wrap(~funder_dataset,scales="free") 
scatPlot_use_cite

# for all records, usage and citation
scatPlot_all_use_cite <- ggplot(df,aes(x=`Since 2013 Usage Count`,y=`Times Cited, All Databases`,color=oa_summary)) +
  geom_point() +  
  ggtitle("Usage and Citation by OA Designations, all funders")+
  scale_color_manual(values=colors)


# by funder, citation distribution by oa type

boxPlot_citations_byFunder <- df %>% filter(`Times Cited, All Databases` > 0) %>%
 ggplot( aes(fill=oa_summary, y=`Times Cited, All Databases`, x=oa_summary)) + 
  geom_boxplot(position="dodge")+
  scale_fill_manual(values=colors)+
  scale_y_log10() +
  ggtitle("Citation Distributions by OA Type and Funder") +
  theme(axis.ticks.x = element_blank(),
        axis.text.x = element_blank())+
  facet_wrap(~funder_dataset,scales="free")


boxPlot_usage_byFunder <- df %>% filter(`Since 2013 Usage Count` > 0) %>%
  ggplot( aes(fill=oa_summary, y=`Since 2013 Usage Count`, x=oa_summary)) + 
  geom_boxplot(position="dodge")+
  scale_fill_manual(values=colors)+
  scale_y_log10() +
  ggtitle("Usage Distributions by OA Type and Funder") +
  theme(axis.ticks.x = element_blank(),
        axis.text.x = element_blank())+
  facet_wrap(~funder_dataset,scales="free")



usageStats_all <-  df %>% group_by(funder_dataset,`Publication Year`) %>%
  summarize(count = n(),
            total_usage = sum(`Since 2013 Usage Count`),
            mean_usage = mean(`Since 2013 Usage Count`, na.rm = TRUE),
            median_usage = median(`Since 2013 Usage Count`,na.rm=TRUE),
            sd_usage = sd(`Since 2013 Usage Count`, na.rm = TRUE),
            total_citation = sum(`Times Cited, All Databases`),
            mean_citation = mean(`Times Cited, All Databases`, na.rm = TRUE),
            median_citation = median(`Times Cited, All Databases`, na.rm=TRUE),
            sd_citation = sd(`Times Cited, All Databases`, na.rm = TRUE))

usageStats_all <- usageStats_all %>% pivot_longer(c(mean_usage,median_usage,
                                                          mean_citation,median_citation),
                                                        names_to = "measure",
                                                        values_to = "value")



usageStats_full <- df %>% group_by(funder_dataset,oa_summary,`Publication Year`) %>%
  summarize(count = n(),
            total_usage = sum(`Since 2013 Usage Count`),
            mean_usage = mean(`Since 2013 Usage Count`, na.rm = TRUE),
            median_usage = median(`Since 2013 Usage Count`,na.rm=TRUE),
            sd_usage = sd(`Since 2013 Usage Count`, na.rm = TRUE),
            total_citation = sum(`Times Cited, All Databases`),
            mean_citation = mean(`Times Cited, All Databases`, na.rm = TRUE),
            median_citation = median(`Times Cited, All Databases`, na.rm=TRUE),
            sd_citation = sd(`Times Cited, All Databases`, na.rm = TRUE))

usageStats_binary <-  df %>% group_by(funder_dataset,oa_binary,`Publication Year`) %>%
  summarize(count = n(),
             total_usage = sum(`Since 2013 Usage Count`),
             mean_usage = mean(`Since 2013 Usage Count`, na.rm = TRUE),
             median_usage = median(`Since 2013 Usage Count`,na.rm=TRUE),
             sd_usage = sd(`Since 2013 Usage Count`, na.rm = TRUE),
             total_citation = sum(`Times Cited, All Databases`),
             mean_citation = mean(`Times Cited, All Databases`, na.rm = TRUE),
             median_citation = median(`Times Cited, All Databases`, na.rm=TRUE),
             sd_citation = sd(`Times Cited, All Databases`, na.rm = TRUE))

usageStats_binary <- usageStats_binary %>% pivot_longer(c(mean_usage,median_usage,
                                                          mean_citation,median_citation),
                                                        names_to = "measure",
                                                        values_to = "value")

usageStats_binary$grp <- paste(usageStats_binary$oa_binary,usageStats_binary$measure)

linePlot_medianStats_byFunder <- usageStats_binary %>%  filter(stringr::str_detect(measure, 'median')) %>%
  ggplot(aes(x=`Publication Year`,y=value,
                             color=grp,
             group=grp)) +
                      geom_line() +
  geom_point()+
  ggtitle("Median Citation and Usage by Publication Year, OA Type and Funder")+
  scale_color_manual(values=c("NOT_OA median_citation"="darkblue",
                              "NOT_OA median_usage" = "lightblue",
                              "OA median_citation" = "darkgreen",
                              "OA median_usage" = "lightgreen"
                              ))+
  facet_wrap(~funder_dataset,scales = "free")



linePlot_meanStats_byFunder <- usageStats_binary %>%  filter(stringr::str_detect(measure, 'mean')) %>%
  ggplot(aes(x=`Publication Year`,y=value,
             color=grp,
             group=grp)) +
  geom_line() +
  geom_point()+
  ggtitle("Mean Citation and Usage by Publication Year, OA Type and Funder")+
  scale_color_manual(values=c("NOT_OA mean_citation"="darkblue",
                              "NOT_OA mean_usage" = "lightblue",
                              "OA mean_citation" = "darkgreen",
                              "OA mean_usage" = "lightgreen"
  ))+
  facet_wrap(~funder_dataset,scales = "free")



linePlot_medianStats_allPubs_byFunder <- usageStats_all %>%  
  filter(stringr::str_detect(measure, 'median')) %>%
  ggplot(aes(x=`Publication Year`,y=value,
             color=measure,
             group=measure)) +
  geom_line() +
  geom_point()+
  ggtitle("Median Usage and Citation, All Publications by Year and Funder")+
  facet_wrap(~funder_dataset)

# comapre usage and citation over time for each funder
areaPlot_totalCites <- usageStats_full %>%ggplot(aes(x=`Publication Year`,y=total_citation,
                               group=oa_summary,fill=oa_summary)) +
  geom_area(position = "stack") +   scale_fill_manual(values=colors)+
  ggtitle("Total Citations by Year, OA Designation and Funder")+
  facet_wrap(~funder_dataset,scales = "free") 

# comapre usage and citation over time for each funder
areaPlot_totalUsage<- usageStats_full %>% ggplot(aes(x=`Publication Year`,y=total_usage,
                               group=oa_summary,fill=oa_summary)) +
  geom_area(position = "stack") +   scale_fill_manual(values=colors)+
  ggtitle("Total Usage by Year, OA Designation and Funder")+
  facet_wrap(~funder_dataset, scales="free") 







## sum of usage and citations by funder and year and oatype
usageStats <- df %>% group_by(funder_dataset,oa_summary,`Publication Year`) %>%
  summarize(count = n(),
          total_usage = sum(`Since 2013 Usage Count`),
          mean_usage = mean(`Since 2013 Usage Count`, na.rm = TRUE),
          sd_usage = sd(`Since 2013 Usage Count`, na.rm = TRUE),
         total_citation = sum(`Times Cited, All Databases`),
         mean_citation = mean(`Times Cited, All Databases`, na.rm = TRUE),
         sd_citation = sd(`Times Cited, All Databases`, na.rm = TRUE))

usageStats$oa_summary <- factor(usageStats$oa_summary, levels= c("NO_OA",
                                                                 "AUTHOR_HOSTED",
                                                                 "PUBLISHER_HOSTED",
                                                                 "BOTH"))



# usage since 2013
barPlot_totalUsage <- ggplot(usageStats, aes(fill=oa_summary, y=total_usage, x=`Publication Year`)) + 
  geom_bar(position="stack", stat="identity") + 
  facet_wrap(~funder_dataset,scales="free") +
  ggtitle("Total Usage by Year, OA Designation and Funder")+
  scale_fill_manual(values=colors)



# citations
barPlot_totalCitation <- ggplot(usageStats, aes(fill=oa_summary, y=total_citation, x=`Publication Year`)) + 
  geom_bar(position="stack", stat="identity") + 
  scale_fill_manual(values=colors)+
  ggtitle("Total Citations by Year, OA Designation and Funder")+
  facet_wrap(~funder_dataset,scales="free")


vars <- ls(all.names = TRUE)
plots <- vars[grepl("Plot", vars)]

plots <- mget( plots)


##
df$`Funding Orgs`

cofundingDict <- c()
for (f in funders){
  print(f)
  cofunders <- c()
  d <- df %>% filter(funder_dataset==f)
  d$funders_list <- str_split(d$`Funding Orgs`,";")
  i <- 1
  while (i<length(d$funders_list)) {
    cofunders[[i]] <- d$funders_list[i]
    i <- i+1
  }
  cofundingDict[[f]] <- cofunders
  
}

cofundingFreqDist <- c()
for (f in funders) {
  unpacked <- unlist(cofundingDict[[f]])
  cofundingFreqDist[[f]] <- table(unpacked)
}


lapply(funders, function(t) write.csv(cofundingFreqDist[[t]], file=paste0(t,"_cofunders.csv") ))  




##### analysis of variances

group_by(df, oa_summary,funder_dataset) %>%
  summarise(
    count = n(),
    mean = mean(`Times Cited, All Databases`, na.rm = TRUE),
    sd = sd(`Times Cited, All Databases`, na.rm = TRUE)
  )

group_by(df, oa_binary,funder_dataset) %>%
  summarise(
    count = n(),
    mean = mean(`Times Cited, All Databases`, na.rm = TRUE),
    sd = sd(`Times Cited, All Databases`, na.rm = TRUE)
  )


# Compute the analysis of variance
res.aov <- aov(`Times Cited, All Databases` ~ oa_summary, data = df)
# Summary of the analysis
summary(res.aov)
# 1. Homogeneity of variances
plot(res.aov, 2)

kruskal_results <- c()
wilcox_results <- c()
for (f in funders) {
  #print(f)
  a <- df %>% filter(funder_dataset == f)
  kruskal_results[[f]] = kruskal.test(`Times Cited, All Databases`~oa_summary,data=a)
  #wilcox_results[[f]] = pairwise.wilcox.test(a$`Times Cited, All Databases`, a$oa_summary,p.adjust.method = "BH")
  print(kruskal_results[[f]])
  #print(wilcox_results[[f]])
}

wilcox_results[['osf']]

kruskal.test(`Times Cited, All Databases` ~ funder_dataset, data = df)

pairwise.wilcox.test(df$`Times Cited, All Databases`, df$funder_dataset,p.adjust.method = "BH")
